(() => {
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 const layer=document.querySelector('.pointer-effects'),buttons=[...document.querySelectorAll('.sound-toggle')];
 const css=getComputedStyle(document.documentElement),token=(name,fallback)=>{const value=parseFloat(css.getPropertyValue(name));return Number.isFinite(value)?value:fallback};
 const trailLife=token('--motion-trail',550),sparkLife=token('--motion-spark',580),routeDelay=token('--motion-curtain-cover',220),revealDuration=token('--motion-curtain-reveal',360),revealHold=token('--motion-curtain-hold',0);
 const curtainEase=css.getPropertyValue('--ease-curtain').trim()||'cubic-bezier(.4,0,.2,1)';
 let enabled=true,context,lastTone=0,lastPoint,lastSpark=0,lineIndex=0;
 try{enabled=localStorage.getItem('portfolio-sound')!=='off'}catch{}
 const sync=()=>buttons.forEach(button=>{button.textContent=enabled?'音效 开':'开启音效';button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'关闭互动音效':'开启互动音效')});sync();
 async function unlock(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;if(!context||context.state==='closed')context=new Audio();if(context.state==='suspended')await context.resume();return context.state==='running'}catch{return false}}
 function tone(index=0,click=false){if(!enabled||context?.state!=='running'||document.hidden)return;const now=performance.now();if(!click&&now-lastTone<90)return;lastTone=now;const at=context.currentTime,osc=context.createOscillator(),gain=context.createGain();osc.type='sine';osc.frequency.setValueAtTime((click?660:440)+index*48,at);osc.frequency.exponentialRampToValueAtTime(click?330:620+index*32,at+.09);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(click?.025:.016,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+.12);osc.connect(gain);gain.connect(context.destination);osc.start(at);osc.stop(at+.13);osc.onended=()=>{osc.disconnect();gain.disconnect()}}
 buttons.forEach(button=>button.addEventListener('click',async()=>{enabled=!enabled;try{localStorage.setItem('portfolio-sound',enabled?'on':'off')}catch{}sync();if(enabled&&await unlock())tone(2,true)}));
 window.addEventListener('pointerdown',()=>{if(enabled)void unlock()},{passive:true});
 document.querySelectorAll('.gallery-card,.pill,.home-symbol,.menu-toggle,.mobile-menu nav a,.project-chapters a,.filter,.text-link').forEach((item,i)=>{item.addEventListener('pointerenter',()=>tone(i%7));item.addEventListener('focus',()=>{if(item.matches(':focus-visible'))tone(i%7)})});
 const lines=Array.from({length:48},()=>{const el=document.createElement('i');el.className='trail-line';layer.append(el);return el});
 const sparks=new Set();
 function particle(x,y,angle,distance,life){if(sparks.size>90)return;const el=document.createElement('i');el.className='spark-node';layer.append(el);sparks.add(el);const dx=Math.cos(angle)*distance,dy=Math.sin(angle)*distance;const animation=el.animate([{transform:`translate3d(${x}px,${y}px,0) rotate(${angle}rad) scaleX(.4)`,opacity:1},{transform:`translate3d(${x+dx}px,${y+dy+distance*.18}px,0) rotate(${angle}rad) scaleX(1.7)`,opacity:.8,offset:.45},{transform:`translate3d(${x+dx*1.25}px,${y+dy+distance*.5}px,0) rotate(${angle}rad) scaleX(.25)`,opacity:0}],{duration:life,easing:'cubic-bezier(.15,.6,.3,1)',fill:'forwards'});animation.onfinish=()=>{sparks.delete(el);el.remove()}}
 function burst(x,y,small=false){if(reduce.matches||document.hidden)return;const count=small?3:18;for(let i=0;i<count;i++)particle(x,y,i*Math.PI*2/count+Math.random()*.4,(small?10:35)+Math.random()*(small?15:55),small?sparkLife*.65:sparkLife)}
 const curtain=document.querySelector('.route-curtain');
 const curtainRest=css.getPropertyValue('--curtain-rest-y').trim()||'0px';
 const root=document.documentElement;
 let navigating=false,curtainAnimation;
 function revealPage(){
  clearTimeout(window.routeFallback);if(enabled)void unlock();navigating=false;curtainAnimation?.cancel();root.classList.remove('route-leaving');
  if(reduce.matches){root.classList.remove('route-arriving','route-revealing');return}
  root.classList.add('route-arriving');root.classList.remove('route-revealing');
  requestAnimationFrame(()=>{root.classList.add('route-revealing');window.dispatchEvent(new Event('portfolio:reveal'));curtainAnimation=curtain.animate([{transform:`translateY(${curtainRest})`},{transform:'translateY(-101%)'}],{duration:revealDuration,delay:revealHold,easing:curtainEase,fill:'both'});curtainAnimation.onfinish=()=>{root.classList.remove('route-arriving');curtainAnimation.cancel();burst(innerWidth*.5,innerHeight*.42)}});
 }
 function navigateWithCurtain(url){
  if(navigating)return;navigating=true;curtainAnimation?.cancel();root.classList.remove('route-arriving','route-revealing');root.classList.add('route-leaving');
  curtainAnimation=curtain.animate([{transform:'translateY(100vh)'},{transform:`translateY(${curtainRest})`}],{duration:routeDelay,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});
  setTimeout(()=>location.assign(url.href),routeDelay);
 }
 window.addEventListener('pointermove',event=>{if(!fine.matches||reduce.matches||event.pointerType==='touch')return;const point={x:event.clientX,y:event.clientY};if(lastPoint){const dx=point.x-lastPoint.x,dy=point.y-lastPoint.y,distance=Math.hypot(dx,dy);if(distance>2&&distance<180){const line=lines[lineIndex++%lines.length];line.getAnimations().forEach(a=>a.cancel());line.style.transform=`translate3d(${lastPoint.x}px,${lastPoint.y}px,0) rotate(${Math.atan2(dy,dx)}rad) scaleX(${distance})`;line.animate([{opacity:.9},{opacity:0}],{duration:trailLife,easing:'ease-out',fill:'forwards'});if(distance>7&&performance.now()-lastSpark>170){burst(point.x,point.y,true);lastSpark=performance.now()}}}lastPoint=point},{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{lastPoint=null});
 reduce.addEventListener('change',()=>{lastPoint=null;if(reduce.matches){layer.getAnimations({subtree:true}).forEach(a=>a.cancel());sparks.forEach(el=>el.remove());sparks.clear()}});
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0)return;const target=event.target.closest('a,button');if(!target)return;
  const rect=target.getBoundingClientRect(),x=event.detail?event.clientX:rect.x+rect.width/2,y=event.detail?event.clientY:rect.y+rect.height/2;
  burst(x,y);if(!target.classList.contains('sound-toggle')){if(enabled)void unlock().then(ok=>{if(ok)tone(0,true)})}
  if(reduce.matches||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const link=target.closest('a');if(!link||link.target||link.hasAttribute('download')||link.dataset.lightbox)return;
  const url=new URL(link.href,location.href);if(link.classList.contains('home-symbol')&&url.pathname===location.pathname){event.preventDefault();window.dispatchEvent(new Event('portfolio:reveal'));return}if(url.origin!==location.origin||url.pathname===location.pathname||!['http:','https:'].includes(url.protocol))return;
  event.preventDefault();navigateWithCurtain(url);
 });
 // pageshow also fires when the browser restores a page from its back/forward cache.
 window.addEventListener('pageshow',revealPage);
 window.addEventListener('pagehide',()=>{curtainAnimation?.cancel();root.classList.remove('route-leaving','route-revealing');if(!reduce.matches)root.classList.add('route-arriving');context?.close().catch(()=>{})});
 reduce.addEventListener('change',()=>{if(reduce.matches){curtainAnimation?.cancel();root.classList.remove('route-arriving','route-revealing','route-leaving')}});
})();
