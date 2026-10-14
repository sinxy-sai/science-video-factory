import React from 'react';
import {Composition} from 'remotion';
import {getEpisodeModule} from '../content/episodes/registry.generated';
import {ScienceVideo} from './compositions/ScienceVideo';
import {totalDurationInFrames} from '../content/schema';

export type RootInputProps = {
  episodeId?: string;
};

const defaultEpisode = getEpisodeModule('why-sky-blue');

export const Root: React.FC = () => {
  return (
    <Composition
      id="ScienceVideo"
      component={ScienceVideo}
      durationInFrames={totalDurationInFrames(defaultEpisode.manifest)}
      fps={defaultEpisode.manifest.fps}
      width={defaultEpisode.manifest.width}
      height={defaultEpisode.manifest.height}
      defaultProps={{manifest: defaultEpisode.manifest}}
      calculateMetadata={({props}) => {
        const input = props as RootInputProps & {manifest?: typeof defaultEpisode.manifest};
        const manifest = input.manifest ?? getEpisodeModule(input.episodeId ?? 'why-sky-blue').manifest;
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
