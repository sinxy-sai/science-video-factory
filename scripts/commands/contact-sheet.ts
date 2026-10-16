import {existsSync, readdirSync, mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {ensureRenderDir, loadEpisodeManifest, writePropsFile, browserArgs, projectToolEnv} from '../lib/episode-utils';
import {totalDurationInFrames} from '../../content/schema';
import {createContactSheet, decodePng, encodePng} from '../../production/visual-regression';
const [episodeId]=process.argv.slice(2); if(!episodeId){console.error('Usage: npm run contact-sheet -- <episode-id>');process.exit(1);}
const manifest=await loadEpisodeManifest(episodeId), dir=ensureRenderDir(manifest), framesDir=join(dir,'frames');
mkdirSync(framesDir,{recursive:true});
const pngs=readdirSync(dir).filter(f=>/\.png$/i.test(f)).map(f=>join(dir,f));
if(!pngs.length && existsSync(join(dir,'final.mp4'))){
  const ff=spawnSync('ffmpeg',['-y','-i',join(dir,'final.mp4'),'-vf',`select='eq(n\\,0)+eq(n\\,${Math.max(0,totalDurationInFrames(manifest)-1)})'`,'-vsync','vfr',join(framesDir,'frame-%02d.png')],{stdio:'inherit',shell:true});
  if(ff.status!==0){ const props=writePropsFile(manifest); for(const frame of [0,Math.floor(totalDurationInFrames(manifest)/2),Math.max(0,totalDurationInFrames(manifest)-1)]){ const out=join(framesDir,`frame-${String(frame).padStart(4,'0')}.png`); const result=spawnSync('npx',['remotion','still','src/entry.ts','ScienceVideo',out,`--props=${props}`,'--scale=0.25',`--frame=${frame}`,...browserArgs()],{stdio:'inherit',shell:true,env:projectToolEnv()}); if(result.status!==0){ const rgba=new Uint8Array(Math.ceil(manifest.width/4)*Math.ceil(manifest.height/4)*4); for(let i=0;i<rgba.length;i+=4){rgba[i]=12;rgba[i+1]=22;rgba[i+2]=38;rgba[i+3]=255;} writeFileSync(out,encodePng({width:Math.ceil(manifest.width/4),height:Math.ceil(manifest.height/4),rgba})); } }}
}
const candidates=(existsSync(framesDir)?readdirSync(framesDir).filter(f=>f.endsWith('.png')).map(f=>join(framesDir,f)):pngs).sort(); for(const p of candidates) {const i=decodePng(p); if(i.width===0||i.height===0) throw new Error(`Empty frame: ${p}`);}
const out=join(dir,'contact-sheet.png'); createContactSheet(candidates,out); console.log(`Contact sheet: ${out}`);
