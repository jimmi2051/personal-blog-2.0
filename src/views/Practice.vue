<template>
  <q-page>
    <PageTitle title="Practice" />
    <div class="practice">
      <q-card class="practice-card">
        <q-card-section>
          <div class="text-h6">Practice Test</div>
          <div class="text-subtitle2">
            by {{ store.userProfile.fullname || "Quest" }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions vertical v-if="!store.loading">
          <q-item
            clickable
            v-ripple
            v-for="practice in store.data"
            :key="practice.id"
            :to="`/practice/${practice.id}`"
          >
            <q-item-section avatar>
              <q-avatar
                rounded
                color="primary"
                text-color="white"
                icon="style"
              />
            </q-item-section>
            <q-item-section>
              {{ practice.title }}
            </q-item-section>
            <q-item-section class="total-point">
              {{ practice.totalPoint }}
              <q-icon name="star_border" color="yellow" />
            </q-item-section>
          </q-item>
        </q-card-actions>
        <q-card-actions vertical v-if="store.loading">
          <q-item>
            <q-inner-loading :showing="true">
              <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
          </q-item>
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { mapActions, mapState } from "vuex";
import PageTitle from "components/PageTitle.vue";
function mapStateToProps(state) {
  const userProfile = state.User.userProfile;
  const data = state.Practice.practices.data;
  return {
    userProfile,
    data,
    loading: state.Practice.practices.loading,
  };
}
export default {
  components: {
    PageTitle,
  },
  created: function () {
    this.handleGetPractices();
  },
  methods: {
    ...mapActions("Practice", ["getPractices"]),
    handleGetPractices() {
      let payload = {
        nextErr: (err) => {
          console.log("[ERROR] " + err);
        },
        nextSuccess: () => {
          // console.log("response", response);
        },
      };
      this.getPractices(payload);
    },
  },
  meta: {
    // sets document title
    title: "Practice Page",
    titleTemplate: (title) => `${title} - DefTnt Blog`,
  },
  computed: {
    ...mapState({
      store: mapStateToProps,
    }),
  },
  name: "PracticePage",
};
</script>
