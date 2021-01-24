<template>
  <v-dialog width="256" v-model="dialog">
    <template v-slot:activator="{ on, attrs }">
      <v-list-item link v-bind="attrs" v-on="on">
        <v-list-item-icon>
          <v-icon>mdi-information-variant</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>About</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <v-card :key="cardKey">
      <v-card-title>
        <span class="headline">About</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-text>
        <div>PasteKeys {{ version }}</div>
        <div>Licensed under <a href="LICENSE" target="_blank">GPLv3</a></div>
        <div>Developed by {{ author }}</div>
        <div>
          Open-source on
          <a
            href="https://github.com/matthiasschwarz/paste-keys"
            target="_blank"
            >GitHub</a
          >
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "AboutDialog",
  data: () => ({
    cardKey: 0,
    dialog: false,
  }),
  watch: {
    dialog(show) {
      if (show) this.cardKey += 1;
    },
  },
  computed: {
    author(): string {
      return chrome.runtime.getManifest().author;
    },
    version(): string {
      return chrome.runtime.getManifest().version;
    },
  },
});
</script>
