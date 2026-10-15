import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {EpisodeModule} from '../../content/episode-module';
import type {SceneManifest} from '../../content/schema';
import {getActiveSceneBeat} from '../motion/scene-beats';

export const SceneRenderer: React.FC<{episode: EpisodeModule; scene: SceneManifest}> = ({episode, scene}) => {
  const frame = useCurrentFrame();
  const {beat, beatProgress} = getActiveSceneBeat(scene, frame);
  return <>{episode.renderScene({scene, frame, beat, beatProgress})}</>;
};
