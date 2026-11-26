// Guarda la app en el teléfono para que abra rápido y sin señal.
// Cambia el número de CACHE cada vez que publiques cambios, para que los teléfonos tomen la versión nueva.
const CACHE = "cavalieri-v1";
const BASE = ["./", "index.html", "estilos.css", "comun.js", "config.js", "logo.jpg", "icon-192.png", "manifest.webmanifest",
              "panel/", "panel/index.html", "panel/manifest.webmanifest"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;   // datos de Google: siempre en vivo
  // Primero internet (para ver siempre lo último); si no hay señal, la copia guardada.
  e.respondWith(fetch(e.request).then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
