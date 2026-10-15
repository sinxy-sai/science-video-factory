import type {SceneBeat, SceneManifest} from '../../content/schema';

export type ActiveSceneBeat = {
  beat: SceneBeat | null;
  beatProgress: number;
};

export function getActiveSceneBeat(scene: SceneManifest, frame: number): ActiveSceneBeat {
  const beat = scene.beats.find((candidate) => frame >= candidate.startFrame && frame < candidate.startFrame + candidate.durationInFrames);
  if (!beat) {
    return {beat: null, beatProgress: 0};
  }

  return {
    beat,
    beatProgress: Math.min(1, Math.max(0, (frame - beat.startFrame) / Math.max(1, beat.durationInFrames))),
  };
}
