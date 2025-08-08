import {ExpirationPlugin} from "workbox-expiration";
import {registerRoute} from "workbox-routing";
import {CacheFirst} from "workbox-strategies";

self.skipWaiting();

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

registerRoute(
    (context) => {
        const pathname = context.url.pathname;
        if (pathname === "/nginx-autoindex/sw.js") {
            return false;
        }
        return pathname.startsWith("/nginx-autoindex/");
    },
    new CacheFirst({
        cacheName: "nginx-autoindex-assets",
        plugins: [
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 7,
            }),
        ],
    }),
);
