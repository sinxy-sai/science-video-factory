import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';
type Props={visual:'uncertainty'|'one-bit'|'log-n'};
export const InformationScene:React.FC<Props>=({visual})=>{const shot=visual==='uncertainty'?'shot-001':visual==='one-bit'?'shot-002':'shot-003';return <AbsoluteFill style={{background:'#07111F'}}><OffthreadVideo src={staticFile(`episodes/information-theory/shots/${shot}.mp4`)} muted style={{width:'100%',height:'100%',objectFit:'cover'}}/></AbsoluteFill>};
