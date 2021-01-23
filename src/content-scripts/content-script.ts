import {
  ArraySet,
  Key,
  KeyBindings,
  Mode,
  onStorageChange,
  Settings,
} from "@/core/common";

let settings = Settings();
let keyBindings = KeyBindings([]);
let mode: Mode | null = null;
const pressedKeys = new ArraySet();
let focusedInputField: Node | null = null;

const SELECTION_SUPPORTED_INPUT_ELEMENT_TYPES = new Set([
  "text",
  "search",
  "url",
  "tel",
  "email",
  "number",
]);

const OVERRIDE_WORKAROUND_INPUT_ELEMENT_TYPES = new Set(["email", "number"]);

function getFocusedInputField() {
  const activeElement = document.activeElement;
  if (activeElement === null) return null;
  switch (activeElement.tagName) {
    case "INPUT": {
      const inputElement = activeElement as HTMLInputElement;
      if (inputElement.readOnly) return null;
      if (SELECTION_SUPPORTED_INPUT_ELEMENT_TYPES.has(inputElement.type))
        return activeElement;
      break;
    }
    case "TEXTAREA": {
      const textAreaElement = activeElement as HTMLTextAreaElement;
      if (textAreaElement.readOnly) return null;
      return textAreaElement;
    }
  }
  return (activeElement as HTMLElement).isContentEditable
    ? activeElement
    : null;
}

//Bug: number field invalid input value would be zero length string

function preventInput(event: Event) {
  event.preventDefault();
}

function keydownOnInputFieldListener(event: Event) {
  const key = Key(event as KeyboardEvent);
  if (
    settings.insertCombinationKey != null &&
    !key.equals(settings.insertCombinationKey)
  ) {
    pressedKeys.pushIfNotPresent(key);
    if (pressedKeys.size() === 1 && !keyBindings.isEmpty()) {
      const text = keyBindings.getText(key);
      if (text !== null) {
        const element = event.target as HTMLElement;
        if (element.isContentEditable) {
          const selection = document.getSelection();
          if (selection != null) {
            if (
              selection.anchorNode != null &&
              selection.anchorNode.nodeName == "#text" &&
              selection.focusNode != null &&
              selection.focusNode.nodeName == "#text"
            ) {
              const begin = Math.min(
                selection.anchorOffset,
                selection.focusOffset
              );
              const end = Math.max(
                selection.focusOffset,
                selection.anchorOffset
              );
              element.innerText =
                element.innerText.substring(0, begin) +
                text +
                element.innerText.substring(end);
              selection.collapse(element.firstChild, begin + text.length);
            } else if (element.innerText == "") {
              element.innerText = text;
              selection.collapse(element.firstChild, text.length);
            }
          }
        } else {
          const inputElement = element as
            | HTMLInputElement
            | HTMLTextAreaElement;
          if (!OVERRIDE_WORKAROUND_INPUT_ELEMENT_TYPES.has(inputElement.type))
            inputElement.setRangeText(
              text,
              inputElement.selectionStart ?? inputElement.value.length,
              inputElement.selectionEnd ?? inputElement.value.length,
              "end"
            );
          else inputElement.value += text;
        }
      }
    }
  }
}

function removePressedKeyOnField(event: Event) {
  pressedKeys.remove(Key(event as KeyboardEvent));
}

function addInputFieldListener(inputField: Node) {
  focusedInputField = inputField;
  focusedInputField.addEventListener("beforeinput", preventInput);
  focusedInputField.addEventListener("keydown", keydownOnInputFieldListener);
  focusedInputField.addEventListener("keyup", removePressedKeyOnField);
}

function removeInputFieldListener() {
  focusedInputField?.removeEventListener("beforeinput", preventInput);
  focusedInputField?.removeEventListener(
    "keydown",
    keydownOnInputFieldListener
  );
  focusedInputField?.removeEventListener("keyup", removePressedKeyOnField);
  focusedInputField = null;
}

window.addEventListener("keydown", (event) => {
  const key = Key(event);
  if (
    settings.insertCombinationKey !== null &&
    key.equals(settings.insertCombinationKey) &&
    mode != Mode.PASTE
  ) {
    if (mode == null) mode = Mode.INSERT;
    const inputField = getFocusedInputField();
    if (inputField !== null) {
      if (focusedInputField === null) addInputFieldListener(inputField);
      else if (!inputField.isSameNode(focusedInputField)) {
        removeInputFieldListener();
        addInputFieldListener(inputField);
      }
    }
  } else if (
    settings.pasteCombinationKey !== null &&
    key.equals(settings.pasteCombinationKey) &&
    mode != Mode.INSERT
  ) {
    if (mode == null) mode = Mode.PASTE;
    const inputField = getFocusedInputField();
    if (inputField !== null) {
      if (focusedInputField === null) {
        focusedInputField = inputField;
        focusedInputField.addEventListener("beforeinput", preventInput);
      } else if (!inputField.isSameNode(focusedInputField)) {
        focusedInputField.removeEventListener("beforeinput", preventInput);
        focusedInputField = inputField;
        focusedInputField.addEventListener("beforeinput", preventInput);
      }
    }
  } else if (mode == Mode.PASTE) {
    pressedKeys.pushIfNotPresent(key);
    if (pressedKeys.size() === 1 && !keyBindings.isEmpty()) {
      const text = keyBindings.getText(key);
      if (text !== null) window.navigator.clipboard.writeText(text).then();
    }
  }
});

window.addEventListener("keyup", (event) => {
  const key = Key(event);
  if (mode != null) {
    if (
      settings.insertCombinationKey !== null &&
      key.equals(settings.insertCombinationKey)
    ) {
      mode = null;
      if (focusedInputField !== null) {
        removeInputFieldListener();
        pressedKeys.clear();
      }
    } else if (
      settings.pasteCombinationKey !== null &&
      key.equals(settings.pasteCombinationKey)
    ) {
      mode = null;
      if (focusedInputField !== null) {
        focusedInputField.removeEventListener("beforeinput", preventInput);
        focusedInputField = null;
        pressedKeys.clear();
      }
    } else if (mode == Mode.PASTE) pressedKeys.remove(key);
  }
});

window.addEventListener("load", () => {
  onStorageChange(
    (newSettings) => {
      settings = newSettings;
      if (settings.insertIntoPasswordField)
        SELECTION_SUPPORTED_INPUT_ELEMENT_TYPES.add("password");
      else SELECTION_SUPPORTED_INPUT_ELEMENT_TYPES.delete("password");
    },
    (newKeyBindings) => (keyBindings = newKeyBindings)
  );
  console.debug(`PasteKeys is running on ${window.location}`);
});
