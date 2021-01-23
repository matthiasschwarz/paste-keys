import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark:
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  },
});
