import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {shotBriefSchema, type ShotBrief} from '../../content/shot-brief';
import type {EpisodeModule} from '../../content/episode-module';
import {validatePlanning} from '../../production/planning';

const placeholderTerms = ['Replace with', 'Describe the science', 'Define palette', 'Choose a named', 'TODO', 'TBD'];
const nonEmpty = (path: string) => existsSync(path) && readFileSync(path, 'utf8').trim().length > 0;
const containsPlaceholder = (value: string) => placeholderTerms.some((term) => value.includes(term));

export function loadShotBriefs(episodeId: string): ShotBrief[] {
  const directory = resolve('content', 'episodes', episodeId, 'shot-briefs');
  if (!existsSync(directory)) throw new Error(`${episodeId}: missing shot-briefs/`);
  const files = readdirSync(directory).filter((file) => /^shot-[0-9]{3}\.json$/.test(file)).sort();
  if (files.length === 0) throw new Error(`${episodeId}: shot-briefs/ must contain shot-001.json or later`);
  return files.map((file) => {
    const path = join(directory, file);
    const result = shotBriefSchema.safeParse(JSON.parse(readFileSync(path, 'utf8')));
    if (!result.success) throw new Error(`${episodeId}/${file}: ${result.error.message}`);
    return result.data;
  });
}

export function validateWorkflow(episode: EpisodeModule): void {
  const id = episode.manifest.id;
  const root = resolve('content', 'episodes', id);
  validatePlanning(id);
  for (const file of ['script.md', 'storyboard.md', 'visual-style.md']) {
    const path = join(root, file);
    if (!nonEmpty(path)) throw new Error(`${id}: missing ${file}`);
    const text = readFileSync(path, 'utf8');
    if (placeholderTerms.some((term) => text.includes(term))) throw new Error(`${id}: ${file} still contains placeholder text`);
  }
  for (const directory of ['html', 'manim', 'assets/generated']) {
    if (!existsSync(join(root, directory))) throw new Error(`${id}: missing ${directory}/`);
  }

  const briefs = loadShotBriefs(id);
  const scenes = episode.manifest.scenes;
  const sceneIds = new Set(scenes.map((scene) => scene.id));
  const briefSceneIds = new Set<string>();
  for (const [index, brief] of briefs.entries()) {
    if ([brief.title, brief.narration, brief.visualStyle, brief.visualDirection.composition, brief.visualDirection.focalPoint, brief.visualDirection.palette, brief.visualDirection.typography, brief.motion.entrance, brief.motion.transformation, brief.motion.transition].some(containsPlaceholder)) {
      throw new Error(`${id}/${brief.id}: ShotBrief still contains placeholder visual or motion direction`);
    }
    if (brief.visualStyle !== 'episode-defined') throw new Error(`${id}/${brief.id}: external style packs are not configured; define the episode visual language in visual-style.md`);
    if (brief.renderer === 'browser' && !brief.implementation.sourceRoot.startsWith('html/')) throw new Error(`${id}/${brief.id}: browser shots must use an html/<shot-id>/ sourceRoot`);
    if (brief.implementation.sourceRoot.startsWith('hyperframes/')) throw new Error(`${id}/${brief.id}: legacy hyperframes source paths are not supported`);
    if (!sceneIds.has(brief.sceneId)) throw new Error(`${id}/${brief.id}: sceneId ${brief.sceneId} is not in manifest`);
    briefSceneIds.add(brief.sceneId);
    const scene = scenes.find((item) => item.id === brief.sceneId)!;
    if (!scene.shotAsset) throw new Error(`${id}/${brief.id}: manifest scene ${brief.sceneId} is missing shotAsset; prepare the rendered browser shot before final validation`);
    if (brief.durationInFrames !== scene.durationInFrames) throw new Error(`${id}/${brief.id}: duration does not match manifest scene ${brief.sceneId}`);
    if (brief.renderer === 'browser' && !brief.implementation.files.some((file) => file.startsWith('html/'))) throw new Error(`${id}/${brief.id}: browser shot must declare an html implementation file`);
    for (const file of brief.implementation.files) if (!existsSync(join(root, file))) throw new Error(`${id}/${brief.id}: implementation file does not exist: ${file}`);
    if (index > 0) {
      const previous = briefs[index - 1];
      const previousLeaves = new Set(previous.continuity.leaves);
      for (const inherited of brief.continuity.inherits) if (!previousLeaves.has(inherited)) throw new Error(`${id}/${brief.id}: continuity inherits ${inherited}, but previous shot does not leave it`);
    }
    const captionFrames = scene.captions.reduce((total, caption) => total + caption.durationInFrames, 0);
    if (captionFrames < brief.durationInFrames * 0.8) throw new Error(`${id}/${brief.id}: captions cover less than 80% of shot duration`);
  }
  for (const scene of scenes) if (!briefSceneIds.has(scene.id)) throw new Error(`${id}: manifest scene ${scene.id} has no ShotBrief`);
}
