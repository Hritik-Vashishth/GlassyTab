/* Chrome browser themes are separate from the new-tab extension. */
function matchingTheme(palette){
 const mix=(a,b,t)=>a.map((v,i)=>Math.round(v*(1-t)+b[i]*t));
 const ink=[255,255,255], seed=palette.accent;
 const frame=mix(seed,[0,0,0],.73), toolbar=mix(seed,[0,0,0],.57), field=mix(seed,[0,0,0],.78);
 return {manifest_version:3,name:'Wallpaper Colors',version:'1.0.0',description:'Browser colors generated locally from your selected GlassyTab wallpaper.',theme:{colors:{frame,frame_inactive:mix(frame,[100,100,100],.18),toolbar,tab_text:ink,tab_background_text:ink,bookmark_text:ink,toolbar_button_icon:ink,omnibox_background:field,omnibox_text:ink,ntp_background:frame,ntp_text:ink,ntp_link:mix(seed,ink,.4)},tints:{buttons:[-1,-1,1]}}};
}
// Small uncompressed ZIP writer: no network dependency or third-party library.
function themeZip(manifest){
 const name=new TextEncoder().encode('Wallpaper-Colors/manifest.json');
 const data=new TextEncoder().encode(JSON.stringify(manifest,null,2)+'\n');
 let crc=0xffffffff;for(const byte of data){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}crc=(crc^0xffffffff)>>>0;
 const localSize=30+name.length+data.length, centralSize=46+name.length;
 const bytes=new Uint8Array(localSize+centralSize+22),v=new DataView(bytes.buffer);
 const u16=(o,x)=>v.setUint16(o,x,true),u32=(o,x)=>v.setUint32(o,x,true);
 u32(0,0x04034b50);u16(4,20);u16(12,33);u32(14,crc);u32(18,data.length);u32(22,data.length);u16(26,name.length);bytes.set(name,30);bytes.set(data,30+name.length);
 const c=localSize;u32(c,0x02014b50);u16(c+4,20);u16(c+6,20);u16(c+14,33);u32(c+16,crc);u32(c+20,data.length);u32(c+24,data.length);u16(c+28,name.length);bytes.set(name,c+46);
 const e=c+centralSize;u32(e,0x06054b50);u16(e+8,1);u16(e+10,1);u32(e+12,centralSize);u32(e+16,localSize);return bytes;
}
if(typeof module!=='undefined')module.exports={matchingTheme,themeZip};
