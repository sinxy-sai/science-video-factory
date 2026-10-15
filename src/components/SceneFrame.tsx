import React from 'react';

type SceneFrameProps = {
  children: React.ReactNode;
};

export const SceneFrame: React.FC<SceneFrameProps> = ({children}) => {
  return <div className="scene-safe">{children}</div>;
};
