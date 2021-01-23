export function checkClipboardWritePermission(
  callback: (result: boolean) => void
) {
  chrome.permissions.contains(
    {
      permissions: ["clipboardWrite"],
    },
    callback
  );
}

export function requestClipboardWritePermission(
  callback?: (granted: boolean) => void
) {
  chrome.permissions.request(
    {
      permissions: ["clipboardWrite"],
    },
    callback
  );
}

export function removeClipboardWritePermission(
  callback?: (removed: boolean) => void
) {
  chrome.permissions.remove(
    {
      permissions: ["clipboardWrite"],
    },
    callback
  );
}

export function onStorageChange(
  settingsChanged: (settings: Settings) => void,
  keyBindingsChanged: (keyBindings: KeyBindings) => void
) {
  chrome.storage.local.get((items) => {
    if (items.settings !== undefined) settingsChanged(Settings(items.settings));
    if (items.keyBindings !== undefined)
      keyBindingsChanged(KeyBindings(items.keyBindings));
    chrome.storage.onChanged.addListener((changes) => {
      Object.entries(changes).forEach(([key, value]) => {
        if (value.newValue !== undefined)
          switch (key) {
            case "settings": {
              settingsChanged(Settings(value.newValue));
              break;
            }
            case "keyBindings": {
              keyBindingsChanged(KeyBindings(value.newValue));
              break;
            }
          }
      });
    });
  });
}

export interface Comparable<V> {
  equals(other: V): boolean;
}

export class ArraySet<V extends Comparable<V>> {
  array: Array<V>;
  constructor() {
    this.array = [];
  }
  static of<V extends Comparable<V>>(...values: Array<V>): ArraySet<V> {
    const arraySet = new ArraySet<V>();
    arraySet.array.push(...values);
    return arraySet;
  }
  getIndex(value: V): number {
    return this.array.findIndex((other) => value.equals(other));
  }
  has(value: V): boolean {
    return this.getIndex(value) != -1;
  }
  pushIfNotPresent(value: V): boolean {
    const notPresent = !this.has(value);
    if (notPresent) this.array.push(value);
    return notPresent;
  }
  remove(value: V): boolean {
    const index = this.getIndex(value);
    const has = index != -1;
    if (has) this.array.splice(index, 1);
    return has;
  }
  isEmpty(): boolean {
    return this.array.length == 0;
  }
  size(): number {
    return this.array.length;
  }
  clear() {
    this.array.splice(0, this.array.length);
  }
  toString(): string {
    return this.array.toString();
  }
}

export enum ColorTheme {
  SYSTEM = "System",
  LIGHT = "Light",
  DARK = "Dark",
}

export interface SettingsData {
  colorTheme: ColorTheme;
  insertCombinationKey: KeyData | null;
  pasteCombinationKey: KeyData | null;
  insertIntoPasswordField: boolean;
  [property: string]: any;
}

export interface Settings extends SettingsData {
  clone(): SettingsData;
}

export enum Mode {
  INSERT,
  PASTE,
}

export const ALLOWED_COMBINATION_KEYS = [
  { key: "F2", code: "F2", location: 0 },
  { key: "F4", code: "F4", location: 0 },
  { key: "F8", code: "F8", location: 0 },
  { key: "F9", code: "F9", location: 0 },
];

export const UNUSABLE_KEYS: Array<KeyData> = [
  { key: "Tab", code: "Tab", location: 0 },
  { key: "CapsLock", code: "CapsLock", location: 0 },
  { key: "Shift", code: "ShiftLeft", location: 1 },
  { key: "Shift", code: "ShiftRight", location: 2 },
  { key: "Control", code: "ControlLeft", location: 1 },
  { key: "Control", code: "ControlRight", location: 2 },
  { key: "Alt", code: "AltLeft", location: 1 },
  { key: "AltGraph", code: "AltRight", location: 2 },
  { key: "Escape", code: "Escape", location: 0 },
  { key: "F1", code: "F1", location: 0 },
  { key: "F2", code: "F2", location: 0 },
  { key: "F3", code: "F3", location: 0 },
  { key: "F4", code: "F4", location: 0 },
  { key: "F5", code: "F5", location: 0 },
  { key: "F6", code: "F6", location: 0 },
  { key: "F7", code: "F7", location: 0 },
  { key: "F8", code: "F8", location: 0 },
  { key: "F9", code: "F9", location: 0 },
  { key: "F10", code: "F10", location: 0 },
  { key: "F11", code: "F11", location: 0 },
  { key: "F12", code: "F12", location: 0 },
];

export const DISABLE_DEAD_KEYS = true;

const SETTINGS_DEFAULT: SettingsData = {
  colorTheme: ColorTheme.SYSTEM,
  insertCombinationKey: Key(ALLOWED_COMBINATION_KEYS[2]).clone(),
  pasteCombinationKey: null,
  insertIntoPasswordField: false,
};

export function Settings(settingsData?: SettingsData): Settings {
  const settings = (settingsData !== undefined
    ? settingsData
    : Object.assign({}, SETTINGS_DEFAULT)) as Settings;
  if (settings.clone === undefined)
    settings.clone = function (): SettingsData {
      return {
        colorTheme: this.colorTheme,
        insertCombinationKey:
          this.insertCombinationKey !== null
            ? Key(this.insertCombinationKey).clone()
            : null,
        pasteCombinationKey:
          this.pasteCombinationKey !== null
            ? Key(this.pasteCombinationKey).clone()
            : null,
        insertIntoPasswordField: this.insertIntoPasswordField,
      };
    };
  return settings;
}

export interface KeyData {
  key: string;
  code: string;
  location: number;
}

export interface Key extends KeyData, Comparable<KeyData> {
  clone(): KeyData;
  display(): string;
}

export function Key(keyData: KeyData): Key {
  const key = keyData as Key;
  if (key.equals === undefined)
    key.equals = function (other: KeyData): boolean {
      return (
        this.key == other.key &&
        this.code == other.code &&
        this.location == other.location
      );
    };
  if (key.clone === undefined)
    key.clone = function (): KeyData {
      return { key: this.key, code: this.code, location: this.location };
    };
  if (key.display === undefined)
    key.display = function (): string {
      return this.location == 3 || this.key == " " ? this.code : this.key;
    };
  return key;
}

export interface KeyBindingData {
  key: KeyData;
  text: string;
}

export interface KeyBinding extends KeyBindingData {
  clone(): KeyBindingData;
}

export function KeyBinding(keyBindingData: KeyBindingData): KeyBinding {
  const keyBinding = keyBindingData as KeyBinding;
  if (keyBinding.clone === undefined)
    keyBinding.clone = function (): KeyBindingData {
      return { key: Key(this.key).clone(), text: this.text };
    };
  return keyBinding;
}

export interface KeyBindings {
  getIndex(key: KeyData): number;
  has(key: KeyData): boolean;
  getText(key: KeyData): string | null;
  insert(keyBinding: KeyBindingData): void;
  insertAt(index: number, keyBinding: KeyBindingData): boolean;
  remove(key: KeyData): boolean;
  removeAt(index: number): boolean;
  size(): number;
  isEmpty(): boolean;
}

export function KeyBindings(array: Array<object>): KeyBindings {
  const keyBindings = array as KeyBindings & Array<object>;
  if (keyBindings.getIndex === undefined)
    keyBindings.getIndex = function (key: KeyData): number {
      return this.findIndex((keyBinding) =>
        Key(key).equals((keyBinding as KeyBindingData).key)
      );
    };

  if (keyBindings.has === undefined)
    keyBindings.has = function (key: KeyData): boolean {
      return this.getIndex(key) != -1;
    };

  if (keyBindings.getText === undefined)
    keyBindings.getText = function (key: KeyData): string | null {
      return (
        (this.find((keyBinding) =>
          Key(key).equals((keyBinding as KeyBindingData).key)
        ) as KeyBindingData | undefined)?.text ?? null
      );
    };

  if (keyBindings.insert === undefined)
    keyBindings.insert = function (keyBinding: KeyBindingData) {
      const index = this.getIndex(keyBinding.key);
      if (index != -1) this.splice(index, 1, keyBinding);
      else this.push(keyBinding);
    };

  if (keyBindings.insertAt === undefined)
    keyBindings.insertAt = function (
      index: number,
      keyBinding: KeyBindingData
    ): boolean {
      const hasNot = !this.has(keyBinding.key);
      if (hasNot) this.splice(index, 0, keyBinding);
      return hasNot;
    };

  if (keyBindings.removeAt === undefined)
    keyBindings.removeAt = function (index: number): boolean {
      const validIndex = index >= 0 && index < this.length;
      if (validIndex) this.splice(index, 1);
      return validIndex;
    };

  if (keyBindings.remove === undefined)
    keyBindings.remove = function (key: KeyData): boolean {
      const index = this.getIndex(key);
      const has = index != -1;
      console.log("Remove", index, has, key);
      if (has) this.splice(index, 1);
      return has;
    };

  if (keyBindings.size === undefined)
    keyBindings.size = function (): number {
      return this.length;
    };

  if (keyBindings.isEmpty === undefined)
    keyBindings.isEmpty = function (): boolean {
      return this.length == 0;
    };

  return keyBindings;
}
