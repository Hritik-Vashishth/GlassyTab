let wallpaperURL;
const wallpaperReady = new Promise(resolve => { window.resolveWallpaperReady = resolve; });
function openWallpaperDB(){return new Promise((resolve,reject)=>{const request=indexedDB.open('glasstab-wallpapers',1);request.onupgradeneeded=()=>request.result.createObjectStore('images');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
async function wallpaperData(action, value){const db=await openWallpaperDB();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('images',action==='get'?'readonly':'readwrite');const store=tx.objectStore('images');const request=action==='get'?store.get('selected'):action==='put'?store.put(value,'selected'):store.delete('selected');let result;request.onsuccess=()=>result=request.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
function paletteFor(image){const canvas=document.createElement('canvas');canvas.width=canvas.height=48;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,48,48);const pixels=ctx.getImageData(0,0,48,48).data;const bins=new Map();for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<128)continue;const rgb=[pixels[i],pixels[i+1],pixels[i+2]];const key=rgb.map(c=>Math.floor(c/32)).join(',');const bin=bins.get(key)||{count:0,sum:[0,0,0]};bin.count++;rgb.forEach((c,j)=>bin.sum[j]+=c);bins.set(key,bin);}const ranked=[...bins.values()].sort((a,b)=>b.count-a.count);const base=ranked[0]?ranked[0].sum.map(c=>Math.round(c/ranked[0].count)):[22,22,26];const colorful=ranked.filter(b=>b.count>12).sort((a,b)=>{const score=x=>{const c=x.sum.map(v=>v/x.count);return Math.max(...c)-Math.min(...c);};return score(b)-score(a);})[0];const accent=colorful?colorful.sum.map(c=>Math.round(c/colorful.count)):[210,210,220];return {base,accent};}
function loadWallpaperImage(url,release=false){return new Promise((resolve,reject)=>{
 const image=new Image();image.onload=()=>{if(release)URL.revokeObjectURL(url);resolve(image);};image.onerror=()=>{if(release)URL.revokeObjectURL(url);reject(new Error('This image could not be opened. Choose another PNG, JPEG, WebP or AVIF image.'));};image.src=url;
});}
let appearanceSequence=0;
async function applyAppearance(){
 const seq=++appearanceSequence,root=document.documentElement;
 const fit=localStorage.getItem('wallpaperFit')||'stretch';root.dataset.fit=['stretch','cover','contain'].includes(fit)?fit:'stretch';
 const saved=Number(localStorage.getItem('glassTransparency')??66),t=Number.isFinite(saved)?Math.max(0,Math.min(100,saved)):66;
 root.style.setProperty('--glass-alpha',1-t/100);root.style.setProperty('--glass-blur',`${22*(1-t/100)}px`);
 const blob=await wallpaperData('get');
 if(seq!==appearanceSequence)return;
 let url=blob?URL.createObjectURL(blob):'wallpaper.png',image;
 try{image=await loadWallpaperImage(url);}catch(error){
  if(blob){URL.revokeObjectURL(url);url='wallpaper.png';image=await loadWallpaperImage(url);}else throw error;
 }
 if(seq!==appearanceSequence){if(url.startsWith('blob:'))URL.revokeObjectURL(url);return;}
 const palette=paletteFor(image),previousURL=wallpaperURL;
 wallpaperURL=url.startsWith('blob:')?url:null;
 root.style.setProperty('--wallpaper-image',`url("${url}")`);
 window.wallpaperPalette=palette;
 const colors=localStorage.getItem('autoColors')==='false'?{base:[22,22,26],accent:[210,210,220]}:palette;
 root.style.setProperty('--surface-rgb',colors.base.map(c=>Math.round(c*.22+12)).join(','));
 root.style.setProperty('--accent-rgb',colors.accent.map(c=>Math.round(c*.65+255*.35)).join(','));
 if(previousURL)URL.revokeObjectURL(previousURL);
 document.dispatchEvent(new CustomEvent('appearance-applied',{detail:colors}));window.resolveWallpaperReady();
}
function refreshAppearance(){applyAppearance().catch(error=>{console.warn('Appearance could not be loaded',error);window.resolveWallpaperReady();});}
refreshAppearance();window.addEventListener('storage',refreshAppearance);
