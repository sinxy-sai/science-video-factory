import type React from 'react';
import type {EpisodeManifest, SceneBeat, SceneManifest} from './schema';

export type EpisodeRenderSceneProps = {
  scene: SceneManifest;
  frame: number;
  beat: SceneBeat | null;
  beatProgress: number;
};

export type EpisodeModule = {
  manifest: EpisodeManifest;
  renderScene: (props: EpisodeRenderSceneProps) => React.ReactNode;
};
