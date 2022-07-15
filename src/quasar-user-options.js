import {
  Dialog,
  Loading,
  LoadingBar,
  Meta,
  Notify,
  QAjaxBar,
  QBtn,
  QCard,
  QCardActions,
  QCardSection,
  QFooter,
  QHeader,
  QIcon,
  QImg,
  QItem,
  QLayout,
  QPage,
  QPageContainer,
  QParallax,
  QRating,
  QTimeline,
  QTimelineEntry,
  QToolbar,
} from "quasar";

import iconSet from "quasar/icon-set/fontawesome-v6";

// To be used on app.use(Quasar, { ... })
export default {
  config: {
    LoadingBar,
    Notify,
  },
  plugins: {
    LoadingBar,
    Loading,
    Notify,
    Dialog,
    Meta,
  },
  components: {
    /* not needed if importStrategy is not 'manual' */
    QPageContainer,
    QPage,
    QLayout,
    QHeader,
    QFooter,
    QToolbar,
    QBtn,
    QImg,
    QItem,
    QIcon,
    QAjaxBar,
    QParallax,
    QTimeline,
    QTimelineEntry,
    QRating,
    QCard,
    QCardSection,
    QCardActions,
  },
  iconSet: iconSet,
};

LoadingBar.setDefaults({
  color: "light-blue-3",
  size: "3px",
  position: "top",
});
