const fit=document.getElementById('fit');const slider=document.getElementById('transparency');const value=document.getElementById('value');
function sync(){fit.value=document.documentElement.dataset.fit;slider.value=Math.round((1-Number(document.documentElement.style.getPropertyValue('--glass-alpha')))*100);value.textContent=slider.value+'%';}
sync();fit.addEventListener('change',()=>{localStorage.setItem('wallpaperFit',fit.value);applyAppearance();});slider.addEventListener('input',()=>{localStorage.setItem('glassTransparency',slider.value);applyAppearance();value.textContent=slider.value+'%';});window.addEventListener('storage',sync);

const filePicker=document.getElementById('wallpaperFile'), status=document.getElementById('status'),autoColors=document.getElementById('autoColors');
autoColors.checked=localStorage.getItem('autoColors')!=='false';
autoColors.addEventListener('change',()=>{localStorage.setItem('autoColors',autoColors.checked);applyAppearance();});
filePicker.addEventListener('change',async()=>{
 const file=filePicker.files[0];filePicker.value='';if(!file)return;
 filePicker.disabled=true;exportTheme.disabled=true;
 try{
  if(file.size>25*1024*1024)throw new Error('Choose an image smaller than 25 MB.');
  if(!['image/png','image/jpeg','image/webp','image/avif'].includes(file.type))throw new Error('Choose a PNG, JPEG, WebP or AVIF image.');
  status.textContent='Loading wallpaper…';
  await loadWallpaperImage(URL.createObjectURL(file),true);
  await wallpaperData('put',file);
  await applyAppearance();
  localStorage.setItem('wallpaperRevision',crypto.randomUUID());
  status.textContent='Wallpaper saved. You can choose another image at any time.';
 }catch(error){status.textContent=error.message||'Could not save the image. Try a smaller image.';}
 finally{filePicker.disabled=false;exportTheme.disabled=!window.wallpaperPalette;}
});
document.addEventListener('appearance-applied',event=>{const swatches=document.getElementById('swatches');swatches.replaceChildren();for(const color of [event.detail.base,event.detail.accent]){const swatch=document.createElement('span');swatch.style.backgroundColor=`rgb(${color.join(',')})`;swatches.append(swatch);}});

const exportTheme=document.getElementById('exportTheme');
function showBrowserPalette(){if(!window.wallpaperPalette)return;exportTheme.disabled=false;const manifest=matchingTheme(window.wallpaperPalette);const preview=document.getElementById('browserPalette');preview.replaceChildren();for(const key of ['frame','toolbar','omnibox_background']){const chip=document.createElement('span');chip.style.backgroundColor=`rgb(${manifest.theme.colors[key]})`;chip.textContent=key==='frame'?'Tabs':key==='toolbar'?'Toolbar':'Address bar';preview.append(chip);}}
document.addEventListener('appearance-applied',showBrowserPalette);if(window.wallpaperPalette)showBrowserPalette();

exportTheme.addEventListener('click',()=>{try{if(!window.wallpaperPalette)throw new Error('Wait for your wallpaper to load.');const zip=themeZip(matchingTheme(window.wallpaperPalette));const url=URL.createObjectURL(new Blob([zip],{type:'application/zip'}));const link=document.createElement('a');link.href=url;link.download='Wallpaper-Colors.zip';link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='Matching theme downloaded. Extract it, then Load unpacked > Wallpaper-Colors in chrome://extensions.';}catch(error){status.textContent=error.message;}});
