import Vue from "vue";
import Vuex from "vuex";
import { Settings, KeyBindings, SettingsData } from "@/core/common";

Vue.use(Vuex);

function setSettingProperty(settings: Settings, property: string, value: any) {
  const oldValue = (settings as SettingsData)[property];
  if (oldValue !== undefined && value !== oldValue)
    (settings as SettingsData)[property] = value;
}

const settingsModule = {
  namespaced: true,
  state: {
    settings: Settings(),
  },
  getters: {
    get(state: any): Settings {
      return state.settings;
    },
  },
  mutations: {
    set(state: any, settings: Settings) {
      state.settings = settings;
    },
    setInsertIntoPasswordField(state: any, value: boolean) {
      setSettingProperty(state.settings, "insertIntoPasswordField", value);
    },
  },
  actions: {
    sync(context: any, settings?: Settings) {
      if (settings !== undefined) context.state.settings = settings;
      chrome.storage.local.set({ settings: context.state.settings });
    },
  },
};

const keyBindingsModule = {
  namespaced: true,
  state: {
    keyBindings: KeyBindings([]),
  },
  getters: {
    get(state: any): KeyBindings {
      return state.keyBindings;
    },
  },
  mutations: {
    set(state: any, keyBindings: KeyBindings) {
      state.keyBindings = keyBindings;
    },
  },
  actions: {
    sync(context: any, keyBindings?: KeyBindings) {
      if (keyBindings !== undefined) context.state.keyBindings = keyBindings;
      chrome.storage.local.set({ keyBindings: context.state.keyBindings });
    },
  },
};

export default new Vuex.Store({
  modules: {
    settings: settingsModule,
    keyBindings: keyBindingsModule,
  },
  actions: {
    syncAll(context: any) {
      context.dispatch("settings/sync").then();
      context.dispatch("keyBindings/sync").then();
    },
  },
});
