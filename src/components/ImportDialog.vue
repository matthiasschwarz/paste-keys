<template>
  <v-dialog width="336" v-model="dialog">
    <template v-slot:activator="{ on, attrs }">
      <v-list-item link v-bind="attrs" v-on="on">
        <v-list-item-icon>
          <v-icon>mdi-import</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Import</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <v-card :key="cardKey">
      <v-card-title>
        <span class="headline">Import</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-text class="pb-0">
        <span>Import settings or key bindings via JSON file</span>
        <v-alert text dense type="warning" class="mt-2 mb-2 text-body-2"
          >This operation could override existing data</v-alert
        >
        <v-file-input
          v-model="file"
          :accept="fileMimeType"
          :rules="[
            (v) => !!v || 'File is required',
            (v) => validMimeType(v) || 'Invalid file type',
          ]"
          required
          label="JSON file"
          prepend-icon="mdi-file"
          class="mt-3"
        ></v-file-input>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="blue darken-1"
          text
          block
          :disabled="!valid"
          @click="importFile"
        >
          Import
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { KeyBindings, Settings } from "@/core/common";

export default Vue.extend({
  name: "ImportDialog",
  data: () => ({
    cardKey: 0,
    dialog: false,
    fileMimeType: "application/json",
    file: undefined as File | undefined | null,
  }),
  computed: {
    valid(): boolean {
      return (
        this.file !== undefined &&
        this.file !== null &&
        this.validMimeType(this.file)
      );
    },
  },
  watch: {
    dialog(show) {
      if (show) {
        this.file = undefined;
        this.cardKey += 1;
      }
    },
  },
  methods: {
    validMimeType(file: File | undefined | null): boolean {
      return (
        file !== undefined && file !== null && file.type == this.fileMimeType
      );
    },
    importFile() {
      if (this.file !== undefined && this.file !== null) {
        this.file.text().then((text) => {
          try {
            const json = JSON.parse(text);
            if (json === null) return;
            if (json.settings !== undefined)
              chrome.storage.local.set({
                settings: Settings(json.settings).clone(),
              });
            if (json.keyBindings !== undefined)
              chrome.storage.local.set({
                keyBindings: KeyBindings(json.keyBindings),
              });
          } catch (error) {
            console.debug("Import error:", error);
          }
        });
      }
      this.dialog = false;
    },
  },
});
</script>
