import { app } from "../../scripts/app.js";
import { $el } from "../../scripts/ui.js";
import { MOD_KEYS } from "./constants.js";
import { DefaultValuesManager } from "./defaults-manager.js";

const defaultsManager = new DefaultValuesManager();
let modifierKeyDown = false;

document.addEventListener("keydown", (event) => {
  if (MOD_KEYS.includes(event.key)) {
    modifierKeyDown = true;
  }
});
document.addEventListener("keyup", (event) => {
  if (MOD_KEYS.includes(event.key)) {
    modifierKeyDown = false;
  }
});

app.registerExtension({
  name: "DefaultValuesExtension",
  beforeConfigureGraph: (args) => {
    const onNodeAdded = app.graph.onNodeAdded;
    app.graph.onNodeAdded = function (...args) {
      defaultsManager.addNodeToWidgetsMap(args[0]);
      if (!app.configuringGraph && !modifierKeyDown) {
        const node = defaultsManager.insertDefaults(args[0]);
        return onNodeAdded?.apply(this, [node, ...args.slice(1)]);
      } else {
        return onNodeAdded?.apply(this, args);
      }
    };
  },
  setup: (args) => {
    app.ui.settings.addSetting({
      id: "default_values_extension",
      name: "Set Custom Default Values",
      // Copied from: https://github.com/comfyanonymous/ComfyUI/blob/628f0b8ebc2c9a51205e5e5a9973f8db348a310f/web/scripts/logging.js#L294
      type: (name, setter, value) => {
        return $el("tr", [
          $el("td", [
            $el("label", {
              textContent: "Custom Default Values",
              for: "default_values_extension_checkbox",
            }),
          ]),
          $el("td", [
            $el("input", {
              id: "default_values_extension_checkbox",
              type: "checkbox",
              checked: value,
              onchange: (event) => {
                setter(event.target.checked);
              },
            }),
            $el("button", {
              textContent: "Edit Custom Defaults",
              onclick: () => {
                app.ui.settings.element.close();
                defaultsManager.show();
              },
              style: {
                fontSize: "14px",
                display: "block",
                marginTop: "5px",
              },
            }),
          ]),
        ]);
      },
    });
  },
});
