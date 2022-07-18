import { createRouter, createWebHistory } from "vue-router";

import AuthStorage from "utils/AuthStorage";
import Home from "views/Home.vue";
// import { getCurrentInstance } from "vue";
import app from "main";

// import VueAnalytics from "vue-analytics";
// import VueRouter from "vue-router";
// Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/about",
    name: "about",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    path: "/blogs",
    name: "blogs",
    component: () =>
      import(/* webpackChunkName: "blogs" */ "../views/Blogs.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/blog/:id",
    name: "blog",
    component: () => import(/* webpackChunkName: "blog" */ "../views/Blog.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/signin",
    name: "signin",
    component: () =>
      import(/* webpackChunkName: "signin" */ "../views/SignIn.vue"),
  },
  {
    path: "/signup",
    name: "signup",
    component: () =>
      import(/* webpackChunkName: "signup" */ "../views/SignUp.vue"),
  },
  {
    path: "/practices",
    name: "practices",
    component: () =>
      import(/* webpackChunkName: "signup" */ "../views/Practice.vue"),
  },
  {
    path: "/practice/:id",
    name: "practice",
    component: () =>
      import(/* webpackChunkName: "blog" */ "../views/PracticeDetail.vue"),
  },
  {
    path: "/module/:id",
    name: "module",
    component: () =>
      import(/* webpackChunkName: "blog" */ "../views/ModuleDetail.vue"),
  },
  {
    path: "/video-call",
    name: "video-call",
    component: () =>
      import(/* webpackChunkName: "blog" */ "../views/VideoCall.vue"),
  },
  {
    path: "/:catchAll(.*)", // Unrecognized path automatically matches 404
    name: "homeRedirect",
    component: Home,
  },
];

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: (to, from, savedPosition) => {
    console.log("to", to);
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    } else {
      return { x: 0, y: 0 };
    }
  },
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  console.log("to", to);
  if (to.meta.requiresAuth && !AuthStorage.isLogin) {
    app.$q.notify({
      message: "Oops! Sorry, You must sign in to view this.",
      type: "negative",
    });
    next({ name: "signin" });
    console.log("11");
  } else if (
    (to.name === "signin" || to.name === "signup") &&
    AuthStorage.isLogin
  ) {
    next({ name: from?.name ?? "home" });
    app.$q.notify({
      message: "Hola! You're logged in.",
      type: "warning",
    });
    console.log("22");
  } else next();
});

export default router;
