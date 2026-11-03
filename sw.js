/* =====================================================================
   TaskFlow Relay — service worker
   =====================================================================
   Registered by relay.html with scope "/". It loads the official
   Scramjet controller service-worker bundle from the TaskFlow Relay
   backend (cross-origin importScripts requires the backend's CORS
   headers, which server.js provides) and wires its router into the
   fetch event. Only requests under a proxy frame prefix (/~/sj/...)
   are handled; everything else passes through untouched.
   ===================================================================== */

importScripts("config.js");
importScripts(TASKFLOW_BACKEND + "/controller/controller.sw.js");

self.addEventListener("fetch", (event) => {
  let routed = false;
  try {
    routed = $scramjetController.shouldRoute(event);
  } catch (err) {
    console.error("[TaskFlow Relay SW] shouldRoute failed:", err);
    return; // pass through
  }
  if (!routed) return;

  event.respondWith(
    $scramjetController.route(event).catch((err) => {
      console.error("[TaskFlow Relay SW] route failed:", err);
      return new Response("TaskFlow Relay: internal proxy error (" + (err && err.message ? err.message : err) + ")", {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    })
  );
});
