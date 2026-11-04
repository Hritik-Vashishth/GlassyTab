const input=document.getElementById('query');
const list=document.getElementById('suggestions');
const form=document.querySelector('form');
let timer,controller,sequence=0,active=-1,items=[];
function close(){list.hidden=true;active=-1;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');}
function cancel(){clearTimeout(timer);controller?.abort();sequence++;}
function select(index){active=index;Array.from(list.children).forEach((row,i)=>row.setAttribute('aria-selected',String(i===index)));if(index>=0){input.value=items[index];input.setAttribute('aria-activedescendant',`suggestion-${index}`);}else input.removeAttribute('aria-activedescendant');}
function render(values){items=values;list.replaceChildren();active=-1;input.removeAttribute('aria-activedescendant');values.forEach((value,i)=>{const row=document.createElement('li');row.id=`suggestion-${i}`;row.role='option';row.setAttribute('aria-selected','false');row.textContent=value;row.addEventListener('mousedown',e=>e.preventDefault());row.addEventListener('click',()=>{input.value=value;form.requestSubmit();});list.append(row);});list.hidden=!values.length;input.setAttribute('aria-expanded',String(!!values.length));}
input.addEventListener('input',()=>{
 cancel();close();const query=input.value.trim();if(!query)return;
 const request=sequence;
 timer=setTimeout(async()=>{controller=new AbortController();try{
 const response=await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`,{signal:controller.signal,credentials:'omit'});
 if(!response.ok)throw new Error('Suggestions unavailable');const data=await response.json();
 if(request===sequence&&document.activeElement===input)render(Array.isArray(data[1])?data[1].filter(x=>typeof x==='string').slice(0,8):[]);
 }catch(error){if(request===sequence)close();}},180);
});
input.addEventListener('keydown',e=>{if(e.key==='Escape'){cancel();close();return;}if(!list.hidden&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();select(e.key==='ArrowDown'?(active+1)%items.length:(active-1+items.length)%items.length);}});
input.addEventListener('blur',()=>{cancel();close();});
form.addEventListener('submit',e=>{if(!input.value.trim())e.preventDefault();cancel();close();});
