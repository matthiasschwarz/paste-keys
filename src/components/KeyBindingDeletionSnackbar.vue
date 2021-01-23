<template>
  <v-snackbar v-model="snackbar">
    {{ message }}
    <template v-slot:action="{ attrs }" v-if="keyBinding !== null">
      <v-btn text v-bind="attrs" @click="undo"> Undo </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import Vue from "vue";
// eslint-disable-next-line no-unused-vars
import { KeyBindingData } from "@/core/common";
export default Vue.extend({
  name: "KeyBindingDeletionSnackbar",
  data: () => ({
    snackbar: false,
    index: null as number | null,
    keyBinding: null as KeyBindingData | null,
  }),
  computed: {
    message() {
      return (
        (this.keyBinding !== null ? `${this.keyBinding.key.key} k` : "K") +
        "ey binding deleted"
      );
    },
  },
  methods: {
    show(index: number, keyBinding: KeyBindingData | null) {
      this.snackbar = false;
      this.index = index;
      this.keyBinding = keyBinding;
      this.$nextTick(() => (this.snackbar = true));
    },
    hide() {
      this.snackbar = false;
    },
    undo() {
      this.$emit("undo", { index: this.index, keyBinding: this.keyBinding });
      this.hide();
    },
  },
});
</script>
