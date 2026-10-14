import React from 'react';

export const TitleCard: React.FC<{accent?: string}> = ({accent = '#55B7FF'}) => (
  <div style={{fontSize: 150, color: accent, fontWeight: 800}}>?</div>
);