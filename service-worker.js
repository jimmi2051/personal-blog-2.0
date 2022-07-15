import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);
// Listen for install event, set callback
self.addEventListener("install", function (event) {
  console.log("installed", event);
});
