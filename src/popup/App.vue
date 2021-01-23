<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" width="176">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title"> PasteKeys </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list dense nav>
        <ImportDialog></ImportDialog>
        <ExportDialog></ExportDialog>
        <AboutDialog></AboutDialog>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app dense dark>
      <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
      <v-toolbar-title>PasteKeys</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <SettingsDialog></SettingsDialog>
      </v-toolbar-items>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <v-data-table
          :headers="keyBindingTableHeaders"
          :items="keyBindingTable"
          :height="keyBindingTableHeight"
          no-data-text="No key bindings set"
          sort-by="key"
          disable-sort
          fixed-header
          hide-default-footer
        >
          <template v-slot:item="{ item }">
            <tr>
              <td style="width: 32px">{{ item.keyDisplay }}</td>
              <td class="truncate">{{ item.keyBinding.text }}</td>
              <td style="width: 32px">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      small
                      class="mr-2"
                      @click="showEditKeyBindingDialog(item.keyBinding)"
                      v-bind="attrs"
                      v-on="on"
                    >
                      mdi-pencil
                    </v-icon>
                  </template>
                  <span>Edit</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      small
                      @click="deleteKeyBinding(item.index, item.keyBinding)"
                      v-bind="attrs"
                      v-on="on"
                    >
                      mdi-delete
                    </v-icon>
                  </template>
                  <span>Delete</span>
                </v-tooltip>
              </td>
            </tr>
          </template>
          <template v-slot:footer>
            <v-divider></v-divider>
            <v-toolbar flat dense>
              <v-spacer></v-spacer>
              <v-btn text @click="showNewKeyBindingDialog">
                New key binding
              </v-btn>
              <v-dialog max-width="500px">
                <v-card>
                  <v-card-title class="headline"
                    >Are you sure you want to delete this item?</v-card-title
                  >
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text>Cancel</v-btn>
                    <v-btn color="blue darken-1" text>OK</v-btn>
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
        </v-data-table>
      </v-container>
      <KeyBindingDeletionSnackbar
        ref="keyBindingDeletionSnackbar"
        @undo="insertKeyBindingAt($event.index, $event.keyBinding)"
      ></KeyBindingDeletionSnackbar>
      <KeyBindingChangeDialog
        ref="keyBindingChangeDialog"
        @save="saveKeyBinding($event)"
      ></KeyBindingChangeDialog>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import SettingsDialog from "@/components/SettingsDialog.vue";
import KeyBindingDeletionSnackbar from "@/components/KeyBindingDeletionSnackbar.vue";
import KeyBindingChangeDialog from "@/components/KeyBindingChangeDialog.vue";
import AboutDialog from "@/components/AboutDialog.vue";
import Vue from "vue";
import {
  ColorTheme,
  Key,
  // eslint-disable-next-line no-unused-vars
  KeyBindingData,
  onStorageChange,
} from "@/core/common";
import ImportDialog from "@/components/ImportDialog.vue";
import ExportDialog from "@/components/ExportDialog.vue";
export default Vue.extend({
  name: "App",

  components: {
    ExportDialog,
    ImportDialog,
    AboutDialog,
    SettingsDialog,
    KeyBindingDeletionSnackbar,
    KeyBindingChangeDialog,
  },

  data: () => ({
    drawer: false,
    windowObjectReference: null,
    keyBindingTableHeight: 0,
    keyBindingTableHeaders: [
      { text: "Key", value: "keyBinding.key.key", sortable: false },
      { text: "Text", value: "keyBinding.text", sortable: false },
      { text: "Actions", value: "actions", sortable: false },
    ],
  }),

  computed: {
    keyBindingTable(): Array<{
      index: number;
      keyBinding: KeyBindingData;
      keyDisplay: string;
    }> {
      const keyBindings = this.$store.getters["keyBindings/get"];
      let keyBindingTable = [];
      if (keyBindings !== null)
        for (const [index, keyBinding] of keyBindings.entries())
          keyBindingTable.push({
            index,
            keyBinding,
            keyDisplay: Key(keyBinding.key).display(),
          });
      return keyBindingTable;
    },
  },
  watch: {
    settingsDialog(newValue: boolean) {
      if (newValue) (this.$refs.keyBindingDeletionSnackbar as any).hide();
    },
  },
  methods: {
    saveKeyBinding(changeEvent: {
      newKeyBinding: KeyBindingData;
      oldKeyBinding: KeyBindingData | null;
    }) {
      this.$store.getters["keyBindings/get"].insert(changeEvent.newKeyBinding);
      if (
        changeEvent.oldKeyBinding !== null &&
        !Key(changeEvent.oldKeyBinding.key).equals(
          changeEvent.newKeyBinding.key
        )
      )
        this.$store.getters["keyBindings/get"].remove(
          changeEvent.oldKeyBinding.key
        );
      this.$store.dispatch("keyBindings/sync").then();
    },
    insertKeyBindingAt(index: number, keyBinding: KeyBindingData) {
      this.$store.getters["keyBindings/get"].insertAt(index, keyBinding);
      this.$store.dispatch("keyBindings/sync").then();
    },
    deleteKeyBinding(index: number, keyBinding: KeyBindingData) {
      this.$store.getters["keyBindings/get"].removeAt(index);
      this.$store.dispatch("keyBindings/sync").then();
      (this.$refs.keyBindingDeletionSnackbar as any).show(index, keyBinding);
    },
    showKeyBindingChangeDialog(title: string, keyBinding?: KeyBindingData) {
      (this.$refs.keyBindingDeletionSnackbar as any).hide();
      (this.$refs.keyBindingChangeDialog as any).showDialog(title, keyBinding);
    },
    showNewKeyBindingDialog() {
      this.showKeyBindingChangeDialog("New key binding");
    },
    showEditKeyBindingDialog(keyBinding: KeyBindingData) {
      this.showKeyBindingChangeDialog("Edit key binding", keyBinding);
    },
    getKeyBindingTableHeight(): number {
      return (
        window.innerHeight -
        48 - // toolbar height
        24 - // container padding
        48 - // button
        1
      );
    },
    resizeEventListener() {
      this.$nextTick(
        () => (this.keyBindingTableHeight = this.getKeyBindingTableHeight())
      );
    },
  },
  created() {
    onStorageChange(
      (settings) => {
        this.$store.commit("settings/set", settings);
        switch (settings.colorTheme) {
          case ColorTheme.LIGHT:
            this.$vuetify.theme.dark = false;
            break;
          case ColorTheme.DARK:
            this.$vuetify.theme.dark = true;
            break;
          case ColorTheme.SYSTEM:
            this.$vuetify.theme.dark =
              window.matchMedia &&
              window.matchMedia("(prefers-color-scheme: dark)").matches;
            break;
        }
      },
      (keyBindings) => this.$store.commit("keyBindings/set", keyBindings)
    );
  },
  mounted() {
    window.addEventListener("resize", this.resizeEventListener);
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeEventListener);
  },
});
</script>

<style>
/* hide scrollbar */
html {
  overflow-y: auto;
}
body {
  height: 480px;
  width: 640px;
}
.truncate {
  max-width: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
