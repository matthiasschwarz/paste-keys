<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn text v-bind="attrs" v-on="on"> Settings </v-btn>
    </template>
    <v-card>
      <v-toolbar dark dense color="primary">
        <v-btn icon dark @click="hide">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Settings</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark text @click="save"> Save </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-list three-line subheader>
        <v-subheader>General</v-subheader>
        <v-list-item>
          <v-list-item-action>
            <v-select
              :value="insertCombinationKey"
              :items="combinationKeyItems"
              @change="setInsertCombinationKey"
              hide-details
              dense
              style="width: 80px"
            ></v-select>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Insert combination key</v-list-item-title>
            <v-list-item-subtitle
              >Change combination key to insert text into a
              field</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-action>
            <v-select
              :value="pasteCombinationKey"
              :items="combinationKeyItems"
              @change="setPasteCombinationKey"
              hide-details
              dense
              style="width: 80px"
            ></v-select>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Paste combination key</v-list-item-title>
            <v-list-item-subtitle
              >Change combination key to paste text into the
              clipboard</v-list-item-subtitle
            >
            <v-alert type="info" dense text class="ma-0 text-subtitle-2"
              >Requires additional permission to write to the clipboard</v-alert
            >
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-action>
            <v-select
              v-model="settings.colorTheme"
              :items="['System', 'Light', 'Dark']"
              hide-details
              dense
              style="width: 96px"
            ></v-select>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Color theme</v-list-item-title>
            <v-list-item-subtitle>Change color theme</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list three-line subheader>
        <v-subheader>Advanced</v-subheader>
        <v-list-item>
          <v-list-item-action>
            <v-checkbox v-model="settings.insertIntoPasswordField"></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Password field</v-list-item-title>
            <v-list-item-subtitle
              >Enable inserting text into a password field</v-list-item-subtitle
            >
            <v-alert type="warning" dense text class="ma-0 text-subtitle-2"
              >Stored text is not encrypted don't use this extension as password
              manager</v-alert
            >
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
// eslint-disable-next-line no-unused-vars
import {
  ALLOWED_COMBINATION_KEYS,
  checkClipboardWritePermission,
  removeClipboardWritePermission,
  requestClipboardWritePermission,
  Settings,
} from "@/core/common";

const DISABLED_COMBINATION_KEY_DISPLAY = "None";

export default Vue.extend({
  name: "SettingsDialog",
  data: () => ({
    dialog: false,
    settings: Settings(),
  }),
  computed: {
    insertCombinationKey() {
      return (
        this.settings.insertCombinationKey?.key ??
        DISABLED_COMBINATION_KEY_DISPLAY
      );
    },
    pasteCombinationKey() {
      return (
        this.settings.pasteCombinationKey?.key ??
        DISABLED_COMBINATION_KEY_DISPLAY
      );
    },
    combinationKeyItems() {
      let items = [DISABLED_COMBINATION_KEY_DISPLAY];
      items.push(...ALLOWED_COMBINATION_KEYS.map((value) => value.key));
      return items;
    },
  },
  methods: {
    hide() {
      this.dialog = false;
    },
    handleClipboardWritePermissionOnSave(callback: () => void) {
      checkClipboardWritePermission((result) => {
        if (this.pasteCombinationKey !== DISABLED_COMBINATION_KEY_DISPLAY) {
          if (!result)
            requestClipboardWritePermission((granted) => {
              if (!granted) this.settings.pasteCombinationKey = null;
              callback();
            });
          else callback();
        } else if (result) removeClipboardWritePermission(() => callback());
        else callback();
      });
    },
    save() {
      this.hide();
      this.handleClipboardWritePermissionOnSave(() => {
        this.$store.dispatch("settings/sync", Settings(this.settings.clone()));
      });
    },
    setInsertCombinationKey(key: string) {
      this.settings.insertCombinationKey =
        key != DISABLED_COMBINATION_KEY_DISPLAY
          ? ALLOWED_COMBINATION_KEYS.filter((value) => value.key == key)[0]
          : null;
    },
    setPasteCombinationKey(key: string) {
      this.settings.pasteCombinationKey =
        key != DISABLED_COMBINATION_KEY_DISPLAY
          ? ALLOWED_COMBINATION_KEYS.filter((value) => value.key == key)[0]
          : null;
    },
  },
  watch: {
    dialog(show) {
      if (show)
        this.settings = Settings(this.$store.getters["settings/get"].clone());
    },
    insertCombinationKey(newKey) {
      if (
        newKey !== DISABLED_COMBINATION_KEY_DISPLAY &&
        newKey == this.pasteCombinationKey
      )
        this.settings.pasteCombinationKey = null;
    },
    pasteCombinationKey(newKey) {
      if (
        newKey !== DISABLED_COMBINATION_KEY_DISPLAY &&
        newKey == this.insertCombinationKey
      )
        this.settings.insertCombinationKey = null;
    },
  },
});
</script>
