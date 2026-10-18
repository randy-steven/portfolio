// Establish the arrival curtain before first paint, including history navigation.
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 document.documentElement.classList.add('route-arriving','route-revealing');
 window.routeFallback=setTimeout(()=>document.documentElement.classList.remove('route-arriving','route-revealing','route-leaving'),1000);
}
