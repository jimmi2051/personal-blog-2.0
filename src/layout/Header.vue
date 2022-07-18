<template>
  <div class="fixed-top-custom fixed-top">
    <!-- Menu desktop -->
    <q-toolbar class="bg-black text-white shadow-2 gt-sm">
      <!-- <q-btn flat round dense icon="menu" class="q-mr-sm" /> -->
      <q-item to="/#home" exact>
        <q-img
          :src="require('@/assets/images/logo.png')"
          spinner-color="white"
          style="height: auto; max-width: 50px; width: 50px"
        />
      </q-item>
      <q-separator dark vertical inset />
      <q-btn-toggle
        v-model="activeLink"
        flat
        stretch
        toggle-color="info"
        :options="leftNav"
      />
      <!-- </q-item> -->
      <q-separator dark vertical />
      <q-btn
        type="a"
        href="https://www.facebook.com/beatboxer.mrteo"
        no-shadow
        target="__blank"
      >
        <i
          class="fab fa-facebook fa-2x"
          style="
            line-height: 48px;
            height: 48px;
            text-align: center;
            min-width: 48px;
          "
        />
      </q-btn>
      <q-separator dark vertical />
      <q-btn
        type="a"
        href="https://www.instagram.com/deftnguyen/"
        no-shadow
        target="__blank"
      >
        <i
          class="fab fa-instagram-square fa-2x"
          style="
            line-height: 48px;
            height: 48px;
            text-align: center;
            min-width: 48px;
          "
        />
      </q-btn>
      <q-separator dark vertical />
      <q-space />
      <q-separator dark vertical />
      <q-btn-toggle
        v-model="activeLink"
        flat
        stretch
        toggle-color="info"
        :options="rightNav"
        v-if="!store.userProfile.isLogin"
      />
      <q-item v-if="store.userProfile.isLogin">
        <q-btn stretch @click="handleSignOut" flat label="Sign Out" />
      </q-item>
      <q-separator dark vertical />
      <q-toggle v-model="value" color="light-blue" />
    </q-toolbar>
    <!-- Menu Mobile -->
    <q-toolbar class="bg-black text-white shadow-2 lt-md">
      <q-item to="/" exact>
        <q-img
          :src="require('@/assets/images/logo.png')"
          spinner-color="white"
          style="height: auto; max-width: 50px; width: 50px"
        />
      </q-item>
      <q-separator dark vertical inset />
      <q-item to="/" exact>
        <q-btn stretch flat label="NLT" />
      </q-item>
      <q-space />
      <!-- <q-btn flat round dense icon="menu" class="q-mr-sm" /> -->
      <q-btn flat round dense icon="menu" class="q-mr-sm">
        <q-menu content-class="bg-black text-white" style="width: 280px">
          <q-list class="text-center" dense style="min-width: 250px">
            <q-separator dark inset />
            <q-item clickable v-close-popup>
              <q-btn
                stretch
                flat
                to="/blogs"
                label="Blogs"
                style="margin-left: auto; margin-right: auto"
              />
            </q-item>
            <q-separator dark inset />
            <q-item clickable v-close-popup>
              <q-btn
                stretch
                flat
                to="/about"
                label="About"
                style="margin-left: auto; margin-right: auto"
              />
            </q-item>
            <q-separator dark inset />

            <q-item exact clickable>
              <q-btn
                stretch
                to="/#work"
                flat
                label="Works"
                style="margin-left: auto; margin-right: auto"
              />
            </q-item>
            <q-separator dark inset />
            <q-item exact clickable>
              <q-btn
                stretch
                to="/#contact"
                flat
                label="Contact"
                style="margin-left: auto; margin-right: auto"
              />
            </q-item>
            <q-separator dark inset />
            <q-item clickable v-close-popup v-if="!store.userProfile.isLogin">
              <q-btn
                stretch
                flat
                to="/signin"
                label="Sign In"
                style="margin-left: auto; margin-right: auto"
              />
            </q-item>
            <q-separator dark inset v-if="!store.userProfile.isLogin" />
            <q-item clickable v-close-popup v-if="!store.userProfile.isLogin">
              <q-btn
                stretch
                flat
                to="/signup"
                label="Sign Up"
                style="margin-left: auto; margin-right: auto"
              />
            </q-item>

            <q-item clickable v-close-popup v-if="store.userProfile.isLogin">
              <q-btn
                stretch
                flat
                @click="handleSignOut"
                label="Sign Out"
                style="margin-left: auto; margin-right: auto"
              />
            </q-item>

            <q-separator dark inset />
            <q-btn
              type="a"
              href="https://www.facebook.com/beatboxer.mrteo"
              no-shadow
              target="__blank"
            >
              <i
                class="fab fa-facebook fa-2x"
                style="
                  line-height: 48px;
                  height: 48px;
                  text-align: center;
                  min-width: 48px;
                "
              />
            </q-btn>
            <q-separator dark inset />
            <q-btn
              type="a"
              href="https://www.instagram.com/deftnguyen/"
              no-shadow
              target="__blank"
            >
              <i
                class="fab fa-instagram-square fa-2x"
                style="
                  line-height: 48px;
                  height: 48px;
                  text-align: center;
                  min-width: 48px;
                "
              />
            </q-btn>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </div>
</template>
<script>
import AuthStorage from "utils/AuthStorage";
import { mapActions, mapState } from "vuex";
import { ref } from "vue";

function mapStateToProps(state) {
  const data = state.User.userProfile;
  return {
    userProfile: data,
  };
}
export default {
  data() {
    return {
      value: false,
      AuthStorage,
    };
  },
  methods: {
    ...mapActions("User", ["signOut"]),
    showNotif() {
      this.$q.notify({
        message: "Oops! Sorry, The feature is comming soon. ",
        color: "light-blue",
        icon: "announcement",
      });
    },
    handleSignOut() {
      this.signOut();
      if (this.$route.path !== "/#home") {
        this.$router.push("/#home");
      }
    },
  },
  computed: {
    ...mapState({
      store: mapStateToProps,
    }),
  },
  watch: {
    value(value) {
      this.$q.dark.set(value);
    },
    activeLink(value) {
      this.$router.push(value);
    },
    "$route.fullPath"(to) {
      if (to !== this.activeLink) this.activeLink = to;
    },
  },
  setup() {
    return {
      activeLink: ref("/#home"),

      leftNav: [
        { label: "NLT", value: "/#home" },
        { label: "Blogs", value: "/blogs" },
        { label: "About", value: "/about" },
        { label: "Works", value: "/#work" },
        { label: "Contact", value: "/#contact" },
      ],
      rightNav: [
        { label: "Sign In", value: "/signin" },
        { label: "Sign Up", value: "/signup" },
      ],
    };
  },
  name: "HeaderComponent",
};
</script>
