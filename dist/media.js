(() => {
 'use strict';
 const box=document.querySelector('.lightbox'),picture=box.querySelector('img'),caption=box.querySelector('.lightbox-caption');
 let group=[],index=0,opener;
 const show=()=>{const link=group[index];picture.src=link.href;picture.alt=link.querySelector('img')?.alt||'项目图片';caption.textContent=`${picture.alt} · ${index+1} / ${group.length}`;box.querySelector('.lightbox-original').href=link.href;box.querySelector('.lightbox-prev').disabled=group.length<2;box.querySelector('.lightbox-next').disabled=group.length<2};
 const close=()=>{box.close();document.body.classList.remove('image-open');opener?.focus()};
 document.querySelectorAll('[data-lightbox]').forEach(link=>link.addEventListener('click',event=>{if(!box.showModal||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();opener=link;group=[...document.querySelectorAll(`[data-lightbox="${link.dataset.lightbox}"]`)];index=group.indexOf(link);show();box.showModal();document.body.classList.add('image-open');box.querySelector('.lightbox-close').focus()}));
 box.querySelector('.lightbox-close').addEventListener('click',close);
 box.addEventListener('cancel',event=>{event.preventDefault();close()});
 const step=delta=>{index=(index+delta+group.length)%group.length;show()};
 box.querySelector('.lightbox-prev').addEventListener('click',()=>step(-1));box.querySelector('.lightbox-next').addEventListener('click',()=>step(1));
 box.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();step(-1)}if(event.key==='ArrowRight'){event.preventDefault();step(1)}});
 let runtime;
 function loadHls(){if(window.Hls)return Promise.resolve(window.Hls);if(!runtime)runtime=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/assets/vendor/hls.light.min.js';script.onload=()=>resolve(window.Hls);script.onerror=()=>{runtime=null;script.remove();reject(Error('播放器加载失败'))};document.head.append(script)});return runtime}
 document.querySelectorAll('video[data-hls]').forEach(video=>{
  const button=video.parentElement.querySelector('.stream-start'),status=video.closest('figure').querySelector('.video-status');let hls;
  button.addEventListener('click',async()=>{
   button.disabled=true;status.textContent='正在加载影片…';
   const failed=()=>{status.textContent='影片暂时无法加载，请检查网络后重试。';button.hidden=false;button.disabled=false;hls?.destroy();hls=null};
   const play=()=>{button.hidden=true;status.textContent='';button.disabled=false;video.play().catch(()=>{status.textContent='影片已就绪，点击视频播放按钮继续。'})};
   try{if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=video.dataset.hls;video.addEventListener('error',failed,{once:true});play()}else{const Hls=await loadHls();if(!Hls.isSupported()){status.textContent='此浏览器暂不支持影片播放，请使用新版 Chrome、Edge 或 Safari。';button.disabled=false;return}hls=new Hls({maxBufferLength:20,maxMaxBufferLength:40});hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal)failed()});hls.on(Hls.Events.MANIFEST_PARSED,play);hls.loadSource(video.dataset.hls);hls.attachMedia(video)}}catch{failed()}
  });
 });
 document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause()})}));
 document.querySelectorAll('.external-play').forEach(button=>button.addEventListener('click',()=>{const holder=button.closest('.external-player');const frame=document.createElement('iframe');frame.src=holder.dataset.player;frame.title='台湾岛纪 · 第1集 — 哔哩哔哩播放器';frame.allow='fullscreen; picture-in-picture; encrypted-media';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';holder.replaceChildren(frame);frame.focus()}));
})();
