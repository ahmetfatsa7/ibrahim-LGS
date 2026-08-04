/* LGS Takip — Service Worker
   ÖNEMLİ: Her güncellemede aşağıdaki SURUM numarasını değiştir (1.0.1, 1.0.2 ...).
   Numara değişince telefonlar yeni sürümü indirir ve "Güncelle" bandı çıkar. */
const SURUM = 'v2.4.0';
const CACHE = 'lgs-takip-' + SURUM;

const DOSYALAR = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

/* Kurulum: dosyaları önbelleğe al */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(DOSYALAR)).catch(() => {})
  );
});

/* Etkinleşme: eski sürüm önbelleklerini temizle (VERİLERE DOKUNMAZ) */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Sayfadan "hemen geç" mesajı gelince bekleyen sürümü devreye al */
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

/* İstekler: önce ağ (güncel kalsın), olmazsa önbellek (çevrimdışı çalışsın) */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const kopya = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, kopya)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
