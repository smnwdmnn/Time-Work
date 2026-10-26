/* Time@Work 1.5.3 — update-safe, offline-capable, never touches localStorage */
const CACHE='timeatwork-v1-5-4-20261026';
const ASSETS=['./','./index.html','./style.css','./app.js','./model.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
const APP_FILES=new Set(['','index.html','style.css','app.js','model.js','manifest.webmanifest']);
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    // Critical application files must all be fresh before the new worker takes over.
    await Promise.all(ASSETS.filter(a=>APP_FILES.has(a.replace('./',''))).map(async path=>{
      const response=await fetch(new Request(path,{cache:'reload'}));
      if(!response.ok)throw Error('Update konnte nicht geladen werden: '+path);
      await cache.put(path,response);
    }));
    await Promise.all(ASSETS.filter(a=>!APP_FILES.has(a.replace('./',''))).map(async path=>{
      try{const response=await fetch(new Request(path,{cache:'reload'}));if(response.ok)await cache.put(path,response);}catch(_){}
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('timeatwork-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  // Don't intercept unrelated resources or other GitHub Pages projects.
  const scope=new URL(self.registration.scope);
  if(!url.pathname.startsWith(scope.pathname))return;
  const relative=url.pathname.slice(scope.pathname.length);
  const isApp=request.mode==='navigate'||APP_FILES.has(relative);
  if(isApp){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const key=request.mode==='navigate'?'./index.html':'./'+relative;
      try{
        const fresh=await fetch(new Request(request,{cache:'no-store'}));
        if(fresh.ok){await cache.put(key,fresh.clone());return fresh;}
        throw Error('HTTP '+fresh.status);
      }catch(e){const saved=await cache.match(key);if(saved)return saved;throw e;}
    })());
  }else{
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const saved=await cache.match(request,{ignoreSearch:true});
      if(saved)return saved;
      try{const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;}
      catch(e){throw e;}
    })());
  }
});
