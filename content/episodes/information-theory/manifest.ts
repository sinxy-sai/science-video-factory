import type {EpisodeManifest} from '../../schema';
import {LANDSCAPE_PRESET} from '../../presets';
const captions = (id:string, lines:string[], durationInFrames:number) => lines.map((text,index)=>({id:`${id}-${index}`,text,startFrame:Math.round(index*durationInFrames/lines.length)+4,durationInFrames:Math.floor(durationInFrames/lines.length)-8}));
const beat = (id:string,purpose:'enter'|'focus'|'compare'|'process'|'resolve',startFrame:number,durationInFrames:number)=>({id,purpose,startFrame,durationInFrames});
export const manifest: EpisodeManifest = {
 id:'information-theory', title:'信息为什么可以用 bit 计量？', language:'zh-CN', ...LANDSCAPE_PRESET, theme:'information-grid',
 scenes:[
  {id:'uncertainty',title:'信息减少不确定性',claim:'信息可以理解为不确定性的减少。',visual:'uncertainty',durationInFrames:150,beats:[beat('enter','enter',0,30),beat('focus','focus',30,70),beat('resolve','resolve',100,42)],captions:captions('uncertainty',['信息，不是凭空出现的东西。','它是一次答案，让不确定性减少。'],150),supportingText:'信息 = 不确定性的减少。',accent:'#48D7C4'},
  {id:'one-bit',title:'二选一需要 1 bit',claim:'一次公平的二选一，答案携带 1 bit 信息。',visual:'one-bit',durationInFrames:150,beats:[beat('enter','enter',0,26),beat('compare','compare',26,76),beat('resolve','resolve',102,44)],captions:captions('one-bit',['如果只有两个等可能答案，问一次就够了。','这一次二选一，就是 1 bit。'],150),supportingText:'2 个等可能选择 → log₂2 = 1 bit',accent:'#48D7C4'},
  {id:'log-n',title:'选择越多，需要的 bit 越多',claim:'N 个等可能选择需要 log₂N bit 来区分。',visual:'log-n',durationInFrames:150,beats:[beat('enter','enter',0,28),beat('process','process',28,78),beat('resolve','resolve',106,40)],captions:captions('log-n',['每增加一倍选择，问题就多一层二选一。','所以信息量是 log₂N，而不是 N。'],150),supportingText:'信息量 I = log₂N',accent:'#48D7C4'},
 ],
};
