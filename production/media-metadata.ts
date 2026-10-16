import {existsSync, statSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {totalDurationInFrames, type EpisodeManifest} from '../content/schema';
import {projectToolEnv} from '../scripts/lib/episode-runtime';

export type MediaMetadata = {width:number;height:number;fps:number;duration:number;frames:number;videoCodec:string;audioCodec?:string;hasAudio:boolean;bytes:number;source:'ffprobe'|'manifest'};
function fpsValue(value: string|number|undefined): number { if(typeof value==='number') return value; if(!value) return 0; const [a,b]=value.split('/').map(Number); return b ? a/b : a; }
export function probeMedia(path:string, manifest:EpisodeManifest): MediaMetadata {
  if(!existsSync(path)||statSync(path).size===0) throw new Error(`Missing or empty media: ${path}`);
  const result=spawnSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',path],{encoding:'utf8',shell:true,env:projectToolEnv()});
  if(result.status!==0 || !result.stdout) throw new Error(`ffprobe failed for ${path}: ${(result.stderr||'no diagnostic output').trim()}`);
  let data:any;
  try { data=JSON.parse(result.stdout); } catch { throw new Error(`ffprobe returned invalid JSON for ${path}`); }
  const v=data.streams?.find((s:any)=>s.codec_type==='video');
  const a=data.streams?.find((s:any)=>s.codec_type==='audio');
  if(!v) throw new Error(`No video stream found in ${path}`);
  const duration=Number(v.duration||data.format?.duration||0);
  const fps=fpsValue(v.avg_frame_rate||v.r_frame_rate);
  return {width:Number(v.width),height:Number(v.height),fps,duration,frames:Number(v.nb_frames||Math.round(duration*fps)),videoCodec:String(v.codec_name||''),audioCodec:a?.codec_name,hasAudio:Boolean(a),bytes:statSync(path).size,source:'ffprobe'};
}
export function validateMediaMetadata(meta:MediaMetadata, manifest:EpisodeManifest): void {
  if (meta.source === 'ffprobe' && !meta.videoCodec) throw new Error('Video codec metadata is missing');
  const expectedFrames=totalDurationInFrames(manifest); if(meta.width!==manifest.width||meta.height!==manifest.height) throw new Error(`Dimensions ${meta.width}x${meta.height} do not match ${manifest.width}x${manifest.height}`);
  if(Math.abs(meta.fps-manifest.fps)>0.01) throw new Error(`FPS ${meta.fps} does not match ${manifest.fps}`); if(meta.frames>0&&Math.abs(meta.frames-expectedFrames)>Math.max(2,manifest.fps*0.1)) throw new Error(`Frame count ${meta.frames} does not match ${expectedFrames}`); if(Math.abs(meta.duration-expectedFrames/manifest.fps)>0.15) throw new Error(`Duration ${meta.duration.toFixed(3)}s does not match ${(expectedFrames/manifest.fps).toFixed(3)}s`); if(Boolean(manifest.audio)!==meta.hasAudio) throw new Error(`Audio policy mismatch: expected ${manifest.audio?'audio':'silent'} output`);
}
