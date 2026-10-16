import {deflateSync, inflateSync} from 'node:zlib';
import {readFileSync, writeFileSync} from 'node:fs';

export type PngImage = {width: number; height: number; rgba: Uint8Array};

function u32(n: number): Buffer { const b = Buffer.alloc(4); b.writeUInt32BE(n >>> 0); return b; }
function crc32(data: Buffer): number { let c = 0xffffffff; for (const x of data) { c ^= x; for (let k=0;k<8;k++) c = (c & 1) ? (c >>> 1) ^ 0xedb88320 : c >>> 1; } return (c ^ 0xffffffff) >>> 0; }
function chunk(type: string, data: Buffer): Buffer { const t = Buffer.from(type); const body = Buffer.concat([t, data]); return Buffer.concat([u32(data.length), body, u32(crc32(body))]); }

export function decodePng(path: string): PngImage {
  const b = readFileSync(path); if (b.length < 33 || b.subarray(0,8).compare(Buffer.from([137,80,78,71,13,10,26,10])) !== 0) throw new Error(`Invalid PNG: ${path}`);
  let p=8, width=0, height=0, bit=0, color=0, interlace=0; const idats: Buffer[]=[];
  while (p < b.length) { const n=b.readUInt32BE(p); const type=b.toString('ascii',p+4,p+8); const d=b.subarray(p+8,p+8+n); p += 12+n; if(type==='IHDR'){width=d.readUInt32BE(0);height=d.readUInt32BE(4);bit=d[8];color=d[9];interlace=d[12];} else if(type==='IDAT') idats.push(d); else if(type==='IEND') break; }
  if (!width || !height || bit!==8 || color!==6 || interlace!==0) throw new Error(`Unsupported PNG format (requires 8-bit RGBA, non-interlaced): ${path}`);
  const raw=inflateSync(Buffer.concat(idats)); const stride=width*4; const rgba=new Uint8Array(width*height*4); let rp=0, prev=new Uint8Array(stride);
  for(let y=0;y<height;y++){const filter=raw[rp++]; const row=new Uint8Array(raw.subarray(rp,rp+stride)); rp+=stride; for(let x=0;x<stride;x++){const a=x>=4?row[x-4]:0,bv=prev[x],c=x>=4?prev[x-4]:0; if(filter===1) row[x]=(row[x]+a)&255; else if(filter===2) row[x]=(row[x]+bv)&255; else if(filter===3) row[x]=(row[x]+Math.floor((a+bv)/2))&255; else if(filter===4){const q=a+bv-c; const pa=Math.abs(q-a),pb=Math.abs(q-bv),pc=Math.abs(q-c); row[x]=(row[x]+(pa<=pb&&pa<=pc?a:pb<=pc?bv:c))&255;} else if(filter!==0) throw new Error(`Unsupported PNG filter ${filter}`);} rgba.set(row,y*stride); prev=row; }
  return {width,height,rgba};
}

export function encodePng(image: PngImage): Buffer {
  const rows=Buffer.alloc((image.width*4+1)*image.height); for(let y=0;y<image.height;y++){rows[y*(image.width*4+1)]=0; Buffer.from(image.rgba.buffer,image.rgba.byteOffset+y*image.width*4,image.width*4).copy(rows,y*(image.width*4+1)+1);}
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(image.width,0); ihdr.writeUInt32BE(image.height,4); ihdr[8]=8; ihdr[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}

export function comparePngs(actualPath: string, baselinePath: string, threshold=0.01): {differentPixels:number; totalPixels:number; ratio:number} {
  const a=decodePng(actualPath), b=decodePng(baselinePath); if(a.width!==b.width||a.height!==b.height) throw new Error(`PNG dimensions differ: ${a.width}x${a.height} vs ${b.width}x${b.height}`);
  let different=0; for(let i=0;i<a.rgba.length;i+=4){const d=Math.max(Math.abs(a.rgba[i]-b.rgba[i]),Math.abs(a.rgba[i+1]-b.rgba[i+1]),Math.abs(a.rgba[i+2]-b.rgba[i+2]),Math.abs(a.rgba[i+3]-b.rgba[i+3])); if(d>8) different++;}
  const total=a.width*a.height, ratio=different/total; if(ratio>threshold) throw new Error(`Visual regression ${ratio.toFixed(4)} exceeds threshold ${threshold}`); return {differentPixels:different,totalPixels:total,ratio};
}

export function createContactSheet(paths: string[], outputPath: string, columns=3): {width:number;height:number;paths:string[]} {
  if(!paths.length) throw new Error('No representative PNG frames found'); const imgs=paths.map(decodePng); const cellW=Math.max(...imgs.map(x=>x.width)),cellH=Math.max(...imgs.map(x=>x.height)); const cols=Math.max(1,columns), rows=Math.ceil(imgs.length/cols); const rgba=new Uint8Array(cellW*cols*cellH*rows*4); rgba.fill(255);
  imgs.forEach((im,i)=>{const ox=(i%cols)*cellW, oy=Math.floor(i/cols)*cellH; for(let y=0;y<im.height;y++) for(let x=0;x<im.width;x++){const s=(y*im.width+x)*4,d=((oy+y)*(cellW*cols)+(ox+x))*4; rgba.set(im.rgba.subarray(s,s+4),d);}});
  writeFileSync(outputPath,encodePng({width:cellW*cols,height:cellH*rows,rgba})); return {width:cellW*cols,height:cellH*rows,paths};
}
