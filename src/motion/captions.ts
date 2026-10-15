import type {Caption, SceneManifest} from '../../content/schema';

export function getActiveCaption(scene: SceneManifest, frame: number): Caption | null {
  return scene.captions.find((caption) => frame >= caption.startFrame && frame < caption.startFrame + caption.durationInFrames) ?? null;
}
