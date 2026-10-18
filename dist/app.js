(() => {
 'use strict';
 const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
 const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
 const root=document.documentElement;
 const reduced=()=>motionQuery.matches;
 if(!reduced())root.classList.add('motion-enabled');
 motionQuery.addEventListener('change',()=>{root.classList.toggle('motion-enabled',!reduced());if(reduced()){document.querySelectorAll('.is-pending').forEach(el=>el.classList.remove('is-pending'));resetGallery();}});
 const revealNodes=[...document.querySelectorAll('.reveal')];
 if(!reduced()&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('is-pending');observer.unobserve(entry.target)}}),{threshold:.08});revealNodes.forEach(el=>{if(el.getBoundingClientRect().top>innerHeight*.95)el.classList.add('is-pending');observer.observe(el)})}
 const dialog=document.querySelector('#mobile-menu'),toggle=document.querySelector('.menu-toggle');
 function closeMenu(){dialog.close();document.body.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');toggle.focus()}
 toggle?.addEventListener('click',()=>{dialog.showModal();document.body.classList.add('menu-open');toggle.setAttribute('aria-expanded','true');dialog.querySelector('.menu-close').focus()});
 dialog?.querySelector('.menu-close').addEventListener('click',closeMenu);
 dialog?.addEventListener('cancel',event=>{event.preventDefault();closeMenu()});
 dialog?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{document.body.classList.remove('menu-open');dialog.close()}));
 // One diagonal depth queue; three repeated cycles wrap beyond the viewport.
 const gallery=document.querySelector('.gallery'),track=document.querySelector('.gallery-track');
 let target=0,current=0,frame=0,dragStart=0,dragStartY=0,dragBase=0,dragging=false,moved=false;
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const galleryCards=[...document.querySelectorAll('.gallery-card')];
 const mod=(n,m)=>(n%m+m)%m;
 function galleryStep(){return galleryCards[0]?.offsetWidth*.43||200}
 // A single perspective camera views vertical Y/Z planes spaced along world X.
 // The homogeneous CSS matrix keeps every edge in the same vanishing-point system.
 const camera=[-5.9,3,3.4],distance=Math.hypot(...camera),back=camera.map(v=>v/distance);
 const horizontal=Math.hypot(back[0],back[2]),right=[back[2]/horizontal,0,-back[0]/horizontal];
 const up=[back[1]*right[2],back[2]*right[0]-back[0]*right[2],-back[1]*right[0]];
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 function positionCards(){
  if(!gallery)return;
  if(reduced()){gallery.classList.remove('is-projected');galleryCards.forEach(card=>{card.style.removeProperty('transform');card.style.removeProperty('visibility')});return}
  gallery.classList.add('is-projected');
  const width=gallery.clientWidth,height=gallery.clientHeight,step=galleryStep(),count=galleryCards.length;
  const focal=height/(2*Math.tan(15*Math.PI/360)),worldHeight=2*distance*Math.tan(15*Math.PI/360);
  const ratio=1.6,plateHeight=Math.max(worldHeight,worldHeight*width/height/ratio)*(width<768?.31:.275),plateWidth=plateHeight*ratio;
  galleryCards.forEach(card=>{
   const q=mod(+card.dataset.index-10-current/step+count/2,count)-count/2;
   const w=card.offsetWidth,h=card.offsetHeight,p=[q/1.9,plateHeight/2,-plateWidth/2],dx=[0,0,plateWidth/w],dy=[0,-plateHeight/h,0];
   const depth=distance-dot(back,p),cx=width*.5,cy=height*.52;
   const project=(v,origin=false)=>{const d=(origin?distance:0)-dot(back,v);return [(cx*d+focal*dot(right,v))/depth,(cy*d-focal*dot(up,v))/depth,d/depth]};
   const a=project(dx),b=project(dy),c=project(p,true);
   card.style.transform=`matrix3d(${a[0]},${a[1]},0,${a[2]},${b[0]},${b[1]},0,${b[2]},0,0,1,0,${c[0]},${c[1]},0,1)`;
   card.style.setProperty('--plate-pull',`${.65/plateWidth*w}px`);
   card.style.zIndex=String(100-Math.round(q*3));
   card.style.setProperty('--plate-stack',card.style.zIndex);
  });
  gallery.dataset.scroll=String(Math.round(current));
 }
 function draw(){current+=(target-current)*.1;positionCards();if(Math.abs(target-current)>.1)frame=requestAnimationFrame(draw);else{current=target;positionCards();frame=0}}
 function moveTo(value){target=value;if(!frame)frame=requestAnimationFrame(draw)}
 function resetGallery(){if(!track)return;cancelAnimationFrame(frame);frame=0;target=current=0;positionCards()}
 positionCards();window.addEventListener('resize',positionCards);
 let galleryArrival;
 window.addEventListener('portfolio:reveal',()=>{
  if(!track||reduced())return;
  galleryArrival?.cancel();
  const tokens=getComputedStyle(root),duration=parseFloat(tokens.getPropertyValue('--motion-gallery-arrive'))||650,delay=parseFloat(tokens.getPropertyValue('--delay-gallery-arrive'))||80;
  const distance=galleryStep()*3.5;
  galleryArrival=track.animate([{transform:`translate3d(${distance}px,${-distance*.77}px,0)`},{transform:'translate3d(0,0,0)'}],{duration,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
 });
 gallery?.addEventListener('pointerdown',()=>galleryArrival?.finish());
 gallery?.addEventListener('wheel',()=>galleryArrival?.finish(),{passive:true});
 motionQuery.addEventListener('change',()=>{if(reduced())galleryArrival?.cancel()});
 window.addEventListener('pagehide',()=>galleryArrival?.cancel());
 gallery?.addEventListener('wheel',event=>{if(event.ctrlKey||reduced())return;event.preventDefault();moveTo(target+clamp(event.deltaY+event.deltaX,-350,350)*.85)},{passive:false});
 gallery?.addEventListener('pointerdown',event=>{if(reduced()||event.button!==0)return;dragStart=event.clientX;dragStartY=event.clientY;dragBase=target;dragging=true;moved=false});
 window.addEventListener('pointermove',event=>{if(!dragging)return;const delta=event.clientX-dragStart+(event.clientY-dragStartY)*.65;if(Math.abs(delta)>8)moved=true;if(moved)moveTo(dragBase-delta*.9)});
 window.addEventListener('pointerup',()=>{dragging=false});
 window.addEventListener('pointercancel',()=>{dragging=false;moved=false});
 gallery?.addEventListener('click',event=>{if(moved){event.preventDefault();moved=false}},true);
 // Only the central seven links participate in sequential keyboard navigation.
 galleryCards.forEach(card=>card.addEventListener('focus',()=>{if(reduced()||!card.matches(':focus-visible'))return;cancelAnimationFrame(frame);frame=0;current=target=(+card.dataset.index-10)*galleryStep();positionCards()}));
 // Small project labels follow the native pointer; no custom cursor shape.
 const projectLabel=document.createElement('div');projectLabel.className='gallery-project-label';projectLabel.setAttribute('aria-hidden','true');
 if(gallery)document.body.append(projectLabel);
 let labelCard=null;
 function labelPosition(x,y){projectLabel.style.transform=`translate3d(${clamp(x+24,16,innerWidth-projectLabel.offsetWidth-16)}px,${clamp(y-52,80,innerHeight-100)}px,0)`}
 galleryCards.forEach(card=>{
  card.addEventListener('pointerenter',event=>{if(!finePointer.matches||reduced())return;labelCard=card;projectLabel.replaceChildren();const name=document.createElement('span'),description=document.createElement('small');name.textContent=card.querySelector('.card-project-name').textContent;description.textContent=card.dataset.categoryLabel;projectLabel.append(name,description);projectLabel.classList.add('is-visible');labelPosition(event.clientX,event.clientY)});
  card.addEventListener('pointerleave',()=>{if(labelCard===card){labelCard=null;projectLabel.classList.remove('is-visible')}});
 });
 window.addEventListener('pointermove',event=>{if(labelCard)labelPosition(event.clientX,event.clientY)},{passive:true});
 motionQuery.addEventListener('change',()=>{projectLabel.classList.remove('is-visible');labelCard=null;positionCards()});
 const starButton=document.querySelector('.home-symbol'),star=starButton?.querySelector('.star-glyph');
 let starRotation;
 function spinStar(){if(!star||reduced())return;starRotation?.cancel();const duration=parseFloat(getComputedStyle(root).getPropertyValue('--motion-star-spin'))||540;starRotation=star.animate([{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}],{duration,easing:'cubic-bezier(.16,1,.3,1)'});}
 const homePath=`${root.dataset.basePath||''}/`;
 starButton?.addEventListener('click',event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;spinStar();if(location.pathname!==homePath)try{sessionStorage.setItem('portfolio-star-arrival',String(Date.now()))}catch{}});
 window.addEventListener('portfolio:reveal',()=>{try{const last=Number(sessionStorage.getItem('portfolio-star-arrival'));sessionStorage.removeItem('portfolio-star-arrival');if(location.pathname===homePath&&Date.now()-last<3000)spinStar()}catch{}});
 motionQuery.addEventListener('change',()=>{if(reduced())starRotation?.cancel()});
 const filters=[...document.querySelectorAll('[data-filter]')],cards=[...document.querySelectorAll('[data-category]')];
 filters.forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.filter;filters.forEach(filter=>{const active=filter===button;filter.classList.toggle('is-active',active);filter.setAttribute('aria-pressed',String(active))});let count=0;cards.forEach(card=>{card.hidden=category!=='all'&&card.dataset.category!==category;if(!card.hidden){count++;card.classList.remove('is-pending')}});document.querySelector('#filter-count').textContent=`${String(count).padStart(2,'0')} PROJECTS`;}));
 const form=document.querySelector('.brief-form');let downloadUrl;
 form?.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const text=`你好，嘉韵：\n\n姓名：${data.get('name')}\n邮箱：${data.get('email')}\n方向：${data.get('type')}\n\n项目想法：\n${data.get('message')}`;if(downloadUrl)URL.revokeObjectURL(downloadUrl);downloadUrl=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const link=form.querySelector('.brief-download');link.href=downloadUrl;link.hidden=false;const email=form.querySelector('.brief-email');email.href=`mailto:${form.dataset.recipient}?subject=${encodeURIComponent('创作合作 / '+data.get('name'))}&body=${encodeURIComponent(text)}`;email.hidden=false;form.querySelector('.form-status').textContent='草稿已整理好。打开邮件应用后确认发送；也可以下载文字简报。';email.focus()});
 document.querySelector('.copy-email')?.addEventListener('click',async event=>{const button=event.currentTarget;try{await navigator.clipboard.writeText(button.dataset.email);document.querySelector('.copy-status').textContent='邮箱已复制'}catch{document.querySelector('.copy-status').textContent='请选中上方邮箱复制'}});
 window.addEventListener('pagehide',()=>{if(downloadUrl)URL.revokeObjectURL(downloadUrl)});
 if(!window.HTMLDialogElement){toggle.hidden=true;document.querySelector('.desktop-nav').style.display='flex'}
})();
