import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {shotBriefSchema, type ShotBrief} from '../../content/shot-brief';
import type {EpisodeModule} from '../../content/episode-module';
import {validatePlanning} from '../../production/planning';

const placeholderTerms = ['Replace with', 'Describe the science', 'Define palette', 'Choose a named', 'TODO', 'TBD'];
const nonEmpty = (path: string) => existsSync(path) && readFileSync(path, 'utf8').trim().length > 0;
const containsPlaceholder = (value: string) => placeholderTerms.some((term) => value.includes(term));

const normalizeText = (value: string) => value.replace(/\s+/g, '').trim();
const visibleText = (source: string) => source
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<head\b[\s\S]*?<\/head>/gi, '')
  .replace(/<script\b[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ');

/**
 * Browser shots own the visual relationship; the episode title, shot number,
 * and narration captions belong to metadata/Remotion layers. Keep this check
 * deliberately small and deterministic so it catches the common PPT-like
 * duplication without banning useful labels such as "缓存" or "远处来源".
 */
export function validateBrowserShotText(input: {
  episodeId: string;
  shotId: string;
  title: string;
  captions: string[];
  source: string;
}): void {
  const source = input.source;
  const normalizedSource = normalizeText(visibleText(source));
  const title = normalizeText(input.title);
  if (title.length >= 4 && normalizedSource.includes(title)) {
    throw new Error(`${input.episodeId}/${input.shotId}: browser shot must not render ShotBrief title text; keep titles in metadata and captions in Remotion`);
  }
  if (/(?:SHOT\s*[/#-]?\s*\d{1,3}|镜头\s*[0-9一二三四五六七八九十]+|分镜\s*[0-9一二三四五六七八九十]+)/i.test(visibleText(source))) {
    throw new Error(`${input.episodeId}/${input.shotId}: browser shot must not render shot sequence labels such as SHOT / 001 or 镜头 01`);
  }
  for (const caption of input.captions) {
    const normalizedCaption = normalizeText(caption);
    if (normalizedCaption.length >= 6 && normalizedSource.includes(normalizedCaption)) {
      throw new Error(`${input.episodeId}/${input.shotId}: browser shot repeats caption text; captions are rendered by Remotion`);
    }
    const hanText = caption.replace(/[^\u3400-\u9fff]/g, '');
    const captionFragments = Array.from({length: Math.max(0, hanText.length - 5)}, (_, index) => hanText.slice(index, index + 6));
    if (captionFragments.some((fragment) => normalizedSource.includes(fragment))) {
      throw new Error(`${input.episodeId}/${input.shotId}: browser shot repeats a caption phrase (${captionFragments.join('、')}); captions are rendered by Remotion`);
    }
  }
}

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
    if (brief.renderer === 'manim' && !brief.implementation.sourceRoot.startsWith('manim/')) throw new Error(`${id}/${brief.id}: manim shots must use a manim/<shot-id>/ sourceRoot`);
    if (brief.renderer === 'manim' && !brief.implementation.entryPoint) throw new Error(`${id}/${brief.id}: manim shots must declare implementation.entryPoint`);
    if (brief.implementation.sourceRoot.startsWith('hyperframes/')) throw new Error(`${id}/${brief.id}: legacy hyperframes source paths are not supported`);
    if (!sceneIds.has(brief.sceneId)) throw new Error(`${id}/${brief.id}: sceneId ${brief.sceneId} is not in manifest`);
    briefSceneIds.add(brief.sceneId);
    const scene = scenes.find((item) => item.id === brief.sceneId)!;
    if (brief.durationInFrames !== scene.durationInFrames) throw new Error(`${id}/${brief.id}: duration does not match manifest scene ${brief.sceneId}`);
    if (brief.renderer === 'browser' && !brief.implementation.files.some((file) => file.startsWith('html/'))) throw new Error(`${id}/${brief.id}: browser shot must declare an html implementation file`);
    if (brief.renderer === 'manim' && !brief.implementation.files.some((file) => file.startsWith('manim/') && /\.py$/i.test(file))) throw new Error(`${id}/${brief.id}: manim shot must declare a manim .py implementation file`);
    for (const file of brief.implementation.files) if (!existsSync(join(root, file))) throw new Error(`${id}/${brief.id}: implementation file does not exist: ${file}`);
    if (brief.renderer === 'browser') {
      const sourceFiles = brief.implementation.files.filter((file) => /\.html?$/i.test(file));
      const source = sourceFiles.map((file) => readFileSync(join(root, file), 'utf8')).join('\n');
      validateBrowserShotText({
        episodeId: id,
        shotId: brief.id,
        title: brief.title,
        captions: scene.captions.map((caption) => caption.text),
        source,
      });
    }
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
