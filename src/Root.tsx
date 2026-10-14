import React from 'react';
import {Composition} from 'remotion';
import {getEpisodeManifest} from '../content/episodes';
import {ScienceVideo} from './compositions/ScienceVideo';
import {totalDurationInFrames} from '../content/schema';

export type RootInputProps = {
  episodeId?: string;
};

const defaultEpisode = getEpisodeManifest('why-sky-blue');

export const Root: React.FC = () => {
  return (
    <Composition
      id="ScienceVideo"
      component={ScienceVideo}
      durationInFrames={totalDurationInFrames(defaultEpisode)}
      fps={defaultEpisode.fps}
      width={defaultEpisode.width}
      height={defaultEpisode.height}
      defaultProps={{manifest: defaultEpisode}}
      calculateMetadata={({props}) => {
        const input = props as RootInputProps & {manifest?: typeof defaultEpisode};
        const manifest = input.manifest ?? getEpisodeManifest(input.episodeId ?? 'why-sky-blue');
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
