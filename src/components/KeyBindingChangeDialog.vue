<template>
  <v-dialog v-model="dialog" width="533">
    <v-card :key="cardKey">
      <v-card-title>
        <span class="headline">{{ title }}</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-text class="pb-0">
        <v-form v-model="valid">
          <v-container>
            <v-row>
              <v-col cols="4" align-self="end">
                <v-text-field
                  :value="keyDisplay"
                  label="Key"
                  prepend-icon="mdi-keyboard"
                  @keydown="keydownListener"
                  :rules="[(v) => !!v || 'Key is required']"
                  autocomplete="off"
                  required
                ></v-text-field>
              </v-col>
              <v-col>
                <v-textarea
                  v-model="text"
                  label="Text"
                  rows="3"
                  :rules="[(v) => !!v || 'Text is required']"
                  no-resize
                  required
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="cancel"> Cancel </v-btn>
        <v-btn color="blue darken-1" text @click="save" :disabled="!valid">
          Save
        </v-btn>
      </v-card-actions>
      <v-dialog v-model="overrideConfirmDialog" max-width="270">
        <v-card>
          <v-card-title>
            <span class="headline">Override key binding</span>
          </v-card-title>
          <v-card-text class="pb-0"
            >The {{ keyDisplay }} key is already in use. Override previous key
            binding?
            <v-textarea
              v-model="overrideText"
              label="Text to be replaced:"
              rows="3"
              hide-details
              no-resize
              readonly
            ></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="overrideConfirmDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn color="blue darken-1" text @click="emitSaveAndClose">
              OK
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import {
  // eslint-disable-next-line no-unused-vars
  KeyData,
  // eslint-disable-next-line no-unused-vars
  KeyBindingData,
  Key,
  KeyBinding,
  UNUSABLE_KEYS,
  DISABLE_DEAD_KEYS,
} from "@/core/common";

export default Vue.extend({
  name: "KeyBindingChangeDialog",
  data: () => ({
    cardKey: 0,
    dialog: false,
    overrideConfirmDialog: false,
    overrideText: "",
    title: "",
    oldKeyBinding: null as KeyBindingData | null,
    key: undefined as KeyData | undefined,
    text: undefined as string | undefined,
    valid: true,
  }),
  computed: {
    keyDisplay(): string {
      return this.key != undefined ? Key(this.key).display() : "";
    },
  },
  watch: {
    dialog(show) {
      if (show) this.cardKey += 1;
    },
  },
  methods: {
    showDialog(title: string, keyBinding?: KeyBindingData) {
      this.title = title;
      this.key =
        keyBinding !== undefined ? Key(keyBinding.key).clone() : undefined;
      this.text = keyBinding?.text ?? undefined;
      this.oldKeyBinding =
        keyBinding !== undefined ? KeyBinding(keyBinding).clone() : null;
      this.dialog = true;
    },
    closeDialog() {
      if (this.overrideConfirmDialog) this.overrideConfirmDialog = false;
      this.dialog = false;
    },
    keydownListener(event: Event) {
      event.preventDefault();
      const key = Key(event as KeyboardEvent);
      if (
        UNUSABLE_KEYS.some((value) => key.equals(value)) ||
        (DISABLE_DEAD_KEYS && key.key == "Dead")
      )
        return;
      this.key = key.clone();
    },
    emitSaveAndClose() {
      if (this.key !== undefined && this.text !== undefined)
        this.$emit("save", {
          newKeyBinding: KeyBinding({ key: this.key, text: this.text }),
          oldKeyBinding: this.oldKeyBinding,
        });
      this.closeDialog();
    },
    save() {
      if (
        this.oldKeyBinding === null ||
        !Key(this.oldKeyBinding.key).equals(this.key as KeyData)
      ) {
        const previousText = this.$store.getters["keyBindings/get"].getText(
          this.key as KeyData
        );
        if (previousText !== null) {
          if (previousText === this.text) {
            if (this.oldKeyBinding !== null) this.emitSaveAndClose();
            else this.closeDialog();
          } else {
            this.overrideText = previousText;
            this.overrideConfirmDialog = true;
          }
        } else this.emitSaveAndClose();
      } else if (this.oldKeyBinding.text !== this.text) this.emitSaveAndClose();
      else this.closeDialog();
    },
    cancel() {
      this.$emit("cancel");
      this.closeDialog();
    },
  },
});
</script>
