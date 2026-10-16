import React from 'react';
import type {SceneManifest} from '../../content/schema';
import {ShotAssetScene} from './ShotAssetScene';

export const SceneRenderer: React.FC<{episodeId: string; scene: SceneManifest}> = ({episodeId, scene}) => (
  <ShotAssetScene episodeId={episodeId} scene={scene} />
);
