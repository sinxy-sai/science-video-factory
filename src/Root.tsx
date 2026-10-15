import React from 'react';
import {Composition} from 'remotion';
import {getEpisodeModule} from '../content/episodes/registry.generated';
import type {EpisodeManifest} from '../content/schema';
import {ScienceVideo} from './compositions/ScienceVideo';
import {totalDurationInFrames} from '../content/schema';
import {getDefaultCompositionMetadata} from './defaults';

export type RootInputProps = {
  episodeId?: string;
  manifest?: EpisodeManifest | null;
};

const defaultMetadata = getDefaultCompositionMetadata();

export const Root: React.FC = () => {
  return (
    <Composition
      id="ScienceVideo"
      component={ScienceVideo}
      durationInFrames={defaultMetadata.durationInFrames}
      fps={defaultMetadata.fps}
      width={defaultMetadata.width}
      height={defaultMetadata.height}
      defaultProps={{manifest: null}}
      calculateMetadata={({props}) => {
        const input = props as RootInputProps;
        const manifest = input.manifest ?? (input.episodeId ? getEpisodeModule(input.episodeId).manifest : null);
        if (!manifest) {
          return defaultMetadata;
        }
        return {
          durationInFrames: totalDurationInFrames(manifest),
          fps: manifest.fps,
          width: manifest.width,
          height: manifest.height,
          props: {manifest},
        };
      }}
    />
  );
};
