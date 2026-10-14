import type React from 'react';
import type {EpisodeManifest, SceneManifest} from './schema';

export type EpisodeRenderSceneProps = {
  scene: SceneManifest;
  frame: number;
};

export type EpisodeModule = {
  manifest: EpisodeManifest;
  renderScene: (props: EpisodeRenderSceneProps) => React.ReactNode;
};
