import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {getEpisodeModule} from '../../content/episodes/registry.generated';
import type {EpisodeModule} from '../../content/episode-module';
import type {EpisodeManifest} from '../../content/schema';
import {SceneFrame} from '../components/SceneFrame';
import {SceneRenderer} from '../scenes/SceneRenderer';
import '../styles.css';

export const ScienceVideo: React.FC<{manifest?: EpisodeManifest | null}> = ({manifest}) => {
  if (!manifest) {
    return <AbsoluteFill style={{backgroundColor: '#000'}} />;
  }
  const episode = getEpisodeModule(manifest.id);
  let offset = 0;
  return (
    <AbsoluteFill className="science-video">
      {manifest.scenes.map((scene, sceneIndex) => {
        const from = offset;
        offset += scene.durationInFrames;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={scene.durationInFrames}>
            <SceneContent episode={episode} manifest={manifest} scene={scene} sceneIndex={sceneIndex} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SceneContent: React.FC<{
  episode: EpisodeModule;
  manifest: EpisodeManifest;
  scene: EpisodeManifest['scenes'][number];
  sceneIndex: number;
}> = ({episode, manifest, scene, sceneIndex}) => {
  return (
    <SceneFrame scene={scene} sceneIndex={sceneIndex} sceneCount={manifest.scenes.length}>
      <SceneRenderer episode={episode} scene={scene} />
    </SceneFrame>
  );
};
