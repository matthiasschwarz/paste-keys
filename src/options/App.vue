<template>
  <v-app>
    <v-main>
      <v-card tile elevation="0">
        <v-card-title>Options</v-card-title>
        <v-card-text>
          <v-btn text block @click="reset" color="red" outlined
            >Reset all data</v-btn
          >
          <v-alert text dense type="warning" class="mt-2"
            >This deletes all key bindings and resets settings to
            default</v-alert
          >
        </v-card-text>
      </v-card>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "App",
  methods: {
    reset() {
      chrome.storage.local.clear();
    },
  },
});
</script>

<style>
html {
  height: 128px;
}
/* hide scrollbar */
html {
  overflow-y: auto;
}
</style>
