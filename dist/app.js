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
 // One gallery transform, damped by rAF. Wheel and drag are bounded and never steal tab focus.
 const gallery=document.querySelector('.gallery'),track=document.querySelector('.gallery-track');
 let target=0,current=0,frame=0,dragStart=0,dragBase=0,dragging=false,moved=false;
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 function draw(){current+=(target-current)*.1;track.style.setProperty('--pan-x',`${-current}px`);track.style.setProperty('--pan-y',`${current*.58}px`);if(Math.abs(target-current)>.1)frame=requestAnimationFrame(draw);else frame=0}
 function galleryStep(){const cards=gallery.querySelectorAll('.gallery-card');return Math.abs(parseFloat(getComputedStyle(cards[1]).left)-parseFloat(getComputedStyle(cards[0]).left))}
 function moveTo(value){const limit=galleryStep()*3;target=clamp(value,-limit,limit);if(!frame)frame=requestAnimationFrame(draw)}
 function resetGallery(){if(!track)return;cancelAnimationFrame(frame);frame=0;target=current=0;track.style.removeProperty('--pan-x');track.style.removeProperty('--pan-y')}
 gallery?.addEventListener('wheel',event=>{if(reduced()||event.ctrlKey)return;event.preventDefault();moveTo(target+clamp(event.deltaY+event.deltaX,-100,100)*.6)},{passive:false});
 gallery?.addEventListener('pointerdown',event=>{if(reduced()||event.button!==0)return;dragStart=event.clientX;dragBase=target;dragging=true;moved=false});
 window.addEventListener('pointermove',event=>{if(!dragging)return;const delta=event.clientX-dragStart;if(Math.abs(delta)>8)moved=true;if(moved)moveTo(dragBase-delta*.7)});
 window.addEventListener('pointerup',()=>{dragging=false});
 window.addEventListener('pointercancel',()=>{dragging=false;moved=false});
 gallery?.addEventListener('click',event=>{if(moved){event.preventDefault();moved=false}},true);
 // Focused cards stay within the visible frame for keyboard users, also with reduced motion.
 gallery?.querySelectorAll('.gallery-card').forEach(card=>card.addEventListener('focus',()=>{const style=getComputedStyle(card);cancelAnimationFrame(frame);frame=0;current=target=parseFloat(style.left)-gallery.clientWidth*.5;track.style.setProperty('--pan-x',`${-target}px`);track.style.setProperty('--pan-y',`${gallery.clientHeight*.5-parseFloat(style.top)}px`)}));
 // Cursor is decorative; native pointer and accessible links remain unchanged.
 const cursor=document.querySelector('.view-cursor');
 if(finePointer.matches&&!reduced()){window.addEventListener('pointermove',event=>{cursor.style.transform=`translate3d(${event.clientX+14}px,${event.clientY+14}px,0)`},{passive:true});document.querySelectorAll('.gallery-card,.work-image').forEach(card=>{card.addEventListener('pointerenter',()=>{if(!reduced())cursor.classList.add('is-visible')});card.addEventListener('pointerleave',()=>cursor.classList.remove('is-visible'))})}
 const filters=[...document.querySelectorAll('[data-filter]')],cards=[...document.querySelectorAll('[data-category]')];
 filters.forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.filter;filters.forEach(filter=>{const active=filter===button;filter.classList.toggle('is-active',active);filter.setAttribute('aria-pressed',String(active))});let count=0;cards.forEach(card=>{card.hidden=category!=='all'&&card.dataset.category!==category;if(!card.hidden){count++;card.classList.remove('is-pending')}});document.querySelector('#filter-count').textContent=`${String(count).padStart(2,'0')} PROJECTS`;}));
 const form=document.querySelector('.brief-form');let downloadUrl;
 form?.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const text=`你好，嘉韵：\n\n姓名：${data.get('name')}\n邮箱：${data.get('email')}\n方向：${data.get('type')}\n\n项目想法：\n${data.get('message')}`;if(downloadUrl)URL.revokeObjectURL(downloadUrl);downloadUrl=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const link=form.querySelector('.brief-download');link.href=downloadUrl;link.hidden=false;const email=form.querySelector('.brief-email');email.href=`mailto:${form.dataset.recipient}?subject=${encodeURIComponent('创作合作 / '+data.get('name'))}&body=${encodeURIComponent(text)}`;email.hidden=false;form.querySelector('.form-status').textContent='草稿已整理好。打开邮件应用后确认发送；也可以下载文字简报。';email.focus()});
 document.querySelector('.copy-email')?.addEventListener('click',async event=>{const button=event.currentTarget;try{await navigator.clipboard.writeText(button.dataset.email);document.querySelector('.copy-status').textContent='邮箱已复制'}catch{document.querySelector('.copy-status').textContent='请选中上方邮箱复制'}});
 window.addEventListener('pagehide',()=>{if(downloadUrl)URL.revokeObjectURL(downloadUrl)});
 if(!window.HTMLDialogElement){toggle.hidden=true;document.querySelector('.desktop-nav').style.display='flex'}
})();
