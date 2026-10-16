import React from 'react';
import {Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import type {SceneManifest} from '../../content/schema';

export const ShotAssetScene: React.FC<{episodeId: string; scene: SceneManifest}> = ({episodeId, scene}) => {
  const frame = useCurrentFrame();
  const asset = scene.shotAsset;
  if (!asset) throw new Error(`${episodeId}/${scene.id}: missing shotAsset reference`);
  if (asset.kind === 'mp4' || asset.kind === 'webm') {
    return <OffthreadVideo src={staticFile(asset.path)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
  }
  const frameName = `frame-${String(frame).padStart(6, '0')}.png`;
  return <Img src={staticFile(`${asset.path}/${frameName}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
};
