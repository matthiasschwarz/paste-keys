<template>
  <v-dialog width="336" v-model="dialog">
    <template v-slot:activator="{ on, attrs }">
      <v-list-item link v-bind="attrs" v-on="on">
        <v-list-item-icon>
          <v-icon>mdi-export</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Export</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <v-card :key="cardKey">
      <v-card-title>
        <span class="headline">Export</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-text class="pb-3">
        <span>Export settings or key bindings as JSON file</span>
        <v-row>
          <v-col>
            <v-checkbox
              v-model="downloadSettings"
              label="Settings"
              hide-details
            ></v-checkbox>
          </v-col>
          <v-col>
            <v-checkbox
              v-model="downloadKeyBindings"
              label="Key bindings"
              hide-details
            ></v-checkbox>
          </v-col>
        </v-row>
        <v-text-field
          v-model="fileName"
          label="File name"
          prepend-icon="mdi-file"
          hide-details
          clearable
          class="mt-3"
        >
        </v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="blue darken-1"
          text
          block
          @click="download"
          :disabled="!downloadable"
        >
          Download
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";

const DEFAULT_FILE_NAME = "PasteKeysData";

export default Vue.extend({
  name: "ExportDialog",
  data: () => ({
    cardKey: 0,
    dialog: false,
    fileName: DEFAULT_FILE_NAME as string | null,
    downloadSettings: true,
    downloadKeyBindings: true,
  }),
  watch: {
    dialog(show) {
      if (show) {
        this.fileName = DEFAULT_FILE_NAME;
        this.downloadSettings = true;
        this.downloadKeyBindings = true;
        this.cardKey += 1;
      }
    },
  },
  computed: {
    downloadable(): boolean {
      return (
        (this.downloadSettings || this.downloadKeyBindings) &&
        this.fileName != null &&
        this.fileName != ""
      );
    },
  },
  methods: {
    download() {
      let json: any = {};
      if (this.downloadSettings)
        json.settings = this.$store.getters["settings/get"];
      if (this.downloadKeyBindings)
        json.keyBindings = this.$store.getters["keyBindings/get"];
      const jsonBlob = new Blob([JSON.stringify(json)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(jsonBlob);
      let a = document.createElement("a");
      a.href = url;
      a.download = this.fileName ?? DEFAULT_FILE_NAME;
      a.click();
      URL.revokeObjectURL(url);
      this.dialog = false;
    },
  },
});
</script>
