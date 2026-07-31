// Offline support for the SNF 2026 Trail Guide.
// Upload this file next to index.html — after a visitor's first load,
// the brochure keeps working even with no mobile signal.
var CACHE = "snf-guide-v1";

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(["./"]); }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      var network = fetch(e.request).then(function(resp){
        if(resp && resp.ok){
          var copy = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return resp;
      }).catch(function(){ return cached || caches.match("./"); });
      return cached || network;
    })
  );
});
