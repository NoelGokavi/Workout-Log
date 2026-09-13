// Service worker: caches the tracker so it opens offline. Bump VERSION when you upload a new index.html.
const VERSION='ppl-v2';
const FILES=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET'||url.origin!==location.origin) return;   // never touch Google Sheets / script calls
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(cached=>{
    const net=fetch(e.request).then(res=>{ if(res&&res.ok){ const copy=res.clone(); caches.open(VERSION).then(c=>c.put(e.request,copy)); } return res; })
      .catch(()=>cached||new Response('Offline and not cached',{status:503,headers:{'Content-Type':'text/plain'}}));
    return cached||net;                                                 // serve cache instantly, refresh in background
  }));
});
