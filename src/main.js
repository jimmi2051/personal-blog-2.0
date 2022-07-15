import "./styles/quasar.scss";
import "@quasar/extras/roboto-font/roboto-font.css";
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/fontawesome-v6/fontawesome-v6.css";
import "./styles/_styles.scss";

import App from "./App.vue";
import Markdown from "vue3-markdown-it";
import { Quasar } from "quasar";
// import VueAnalytics from "vue-analytics";
import VueCookies from "vue3-cookies";
import VueGtag from "vue-gtag";
import { createApp } from "vue";
import quasarUserOptions from "./quasar-user-options";
import router from "router";
import store from "store";

const app = createApp(App)
  .use(Quasar, quasarUserOptions)
  .use(VueCookies)
  .use(store)
  .use(router)
  .use(Markdown)
  .use(VueGtag, { config: { id: "UA-166102479-1" } })
  .mount("#app");

export default app;
