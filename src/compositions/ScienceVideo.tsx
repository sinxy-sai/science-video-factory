import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import type {EpisodeManifest} from '../../content/schema';
import {SceneFrame} from '../components/SceneFrame';
import {SceneRenderer} from '../scenes/SceneRenderer';
import '../styles.css';

export const ScienceVideo: React.FC<{manifest: EpisodeManifest}> = ({manifest}) => {
  let offset = 0;
  return (
    <AbsoluteFill className="science-video">
      {manifest.scenes.map((scene, sceneIndex) => {
        const from = offset;
        offset += scene.durationInFrames;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={scene.durationInFrames}>
            <SceneContent manifest={manifest} scene={scene} sceneIndex={sceneIndex} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SceneContent: React.FC<{
  manifest: EpisodeManifest;
  scene: EpisodeManifest['scenes'][number];
  sceneIndex: number;
}> = ({manifest, scene, sceneIndex}) => {
  useCurrentFrame();
  return (
    <SceneFrame scene={scene} sceneIndex={sceneIndex} sceneCount={manifest.scenes.length}>
      <SceneRenderer scene={scene} />
    </SceneFrame>
  );
};
