import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {EpisodeModule} from '../../content/episode-module';
import type {SceneManifest} from '../../content/schema';

export const SceneRenderer: React.FC<{episode: EpisodeModule; scene: SceneManifest}> = ({episode, scene}) => {
  const frame = useCurrentFrame();
  return <>{episode.renderScene({scene, frame})}</>;
};
