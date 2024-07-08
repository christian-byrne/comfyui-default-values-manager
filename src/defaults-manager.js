import { app } from "../../scripts/app.js";
import { $el } from "../../scripts/ui.js";
import { EXTENSION_KEY, TARGETED_WIDGET_TYPES } from "./constants.js";
import { DefaultSettingsDialog } from "./settings-dialog.js";
import { WidgetRecordBuilder } from "./widget-builder.js";

export class DefaultValuesManager {
  constructor() {
    this.enabled = app.ui.settings.settingsValues[EXTENSION_KEY] || false;
    this.widgetsMap = {};
    this.dialog = new DefaultSettingsDialog(this);
    this.widgetRecordBuilder = new WidgetRecordBuilder();
    this.normalRowBorder = "2px solid var(--bg-color)";
    this.errorRowBorder = "4px solid var(--error-text";
  }

  addNodeToWidgetsMap(node) {
    const nodeType = node.type;
    // Skip if node already in map
    if (!nodeType || this.widgetsMap[nodeType]) {
      return;
    }

    // Skip node if it doesn't have any widgets or none of its widgets are relevant
    if (
      !node.widgets ||
      node.widgets.every(
        (widget) => !TARGETED_WIDGET_TYPES.includes(widget.type)
      )
    ) {
      return;
    }

    this.widgetsMap[nodeType] = {};
    for (const [widgetIndex, widget] of Object.entries(node.widgets)) {
      if (!TARGETED_WIDGET_TYPES.includes(widget.type)) {
        continue;
      }
      this.widgetsMap[nodeType][widgetIndex] = this.widgetRecordBuilder
        .from(widget)
        .inferType()
        .addAllowedVals()
        .addSelectedProps()
        .addDefaultVal(
          this.getDefaults().nodeType?.[widgetIndex]?.userDefaultVal
        )
        .build();
    }
  }

  createDialog() {
    return $el(
      "div",
      {
        style: {
          padding: "4px",
          display: "flex",
          flexDirection: "column",
        },
      },
      [this.createTable()]
    );
  }

  createRow(widget, widgetIndex, nodeName) {
    const widgetDefault = this.getDefaults()[nodeName]?.[widgetIndex];
    const tr = $el("tr", [
      $el("td", { textContent: nodeName }),
      $el("td", { textContent: widget.name }),
      $el("td", { textContent: widget.value }),
      $el("td", {
        textContent: widgetDefault ?? "Unset",
        contentEditable: true,
        id: `defaulsRow-${nodeName}-${widgetIndex}`,
        style: {
          color: widgetDefault ? "var(--bg-color)" : "var(--descrip-text)",
          border: this.normalRowBorder,
          textShadow: "none",
          boxShadow: "none",
          backgroundColor: "var(--fg-color)",
        },
        onclick: (event) => {
          if (event.target.textContent === "Unset") {
            event.target.textContent = "";
          }
        },
        oninput: (event) => {
          const expectedType = this.widgetsMap[nodeName][widgetIndex].valueType;
          const allowedValues =
            this.widgetsMap[nodeName][widgetIndex]?.["allowed values"];
          console.log(allowedValues);
          if (
            allowedValues &&
            !allowedValues.includes(event.target.textContent)
          ) {
            console.log("Invalid value");
            document.getElementById(
              `defaulsRow-${nodeName}-${widgetIndex}`
            ).style.border = this.errorRowBorder;
            return;
          }
          const newValue = event.target.textContent;
          let parsedValue;
          switch (expectedType) {
            case "int":
              parsedValue = parseInt(newValue);
              break;
            case "float":
              parsedValue = parseFloat(newValue);
              break;
            case "boolean":
              parsedValue =
                newValue.toLowerCase() === "true" || newValue == "1";
              break;
            default:
              parsedValue = newValue;
              break;
          }
          this.widgetsMap[nodeName][widgetIndex].userDefaultVal = parsedValue;
          this.addDefaultVal(nodeName, widgetIndex, parsedValue);
          document.getElementById(
            `defaulsRow-${nodeName}-${widgetIndex}`
          ).style.color = "var(--bg-color)";
          document.getElementById(
            `defaulsRow-${nodeName}-${widgetIndex}`
          ).style.border = this.normalRowBorder;
        },
      }),
      $el(
        "td",
        {
          style: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          },
        },
        [
          $el("button.comfyui-button.primary", {
            textContent: "Reset",
            style: {
              flexDirection: "column",
              fontSize: "unset",
            },
            onclick: () => {
              console.log("resetting value");
              this.removeDefaultVal(nodeName, widgetIndex);
              this.widgetsMap[nodeName][widgetIndex].userDefaultVal = null;
              this.show();
            },
          }),
        ]
      ),
    ]);

    return tr;
  }

  createTable() {
    const table = $el(
      "table.comfy-table",
      {
        style: {
          width: "100%",
          overflow: "hidden",
        },
      },
      [
        $el("tr", [
          $el("th", { textContent: "Node" }),
          $el("th", { textContent: "Widget" }),
          $el("th", { textContent: "Recently Used Value" }),
          $el("th", { textContent: "Default Value" }),
        ]),
      ]
    );

    for (let nodeType in this.widgetsMap) {
      for (let widgetIndex in this.widgetsMap[nodeType]) {
        const row = this.createRow(
          this.widgetsMap[nodeType][widgetIndex],
          widgetIndex,
          nodeType
        );
        table.appendChild(row);
      }
    }

    return table;
  }

  insertDefaults(node) {
    const nodeType = node.type;
    if (!this.enabled || !nodeType || !this.widgetsMap[nodeType]) {
      return node;
    }

    const nodeWidgets = node.widgets;
    for (const [widgetIndex, widget] of Object.entries(nodeWidgets)) {
      if (!TARGETED_WIDGET_TYPES.includes(widget.type)) {
        continue;
      }

      const widgetDefault = this.getDefaults()[nodeType]?.[widgetIndex];
      if (widgetDefault) {
        node.widgets[widgetIndex].value = widgetDefault;
      }
    }

    return node;
  }

  removeDefaultVal(nodeType, widgetIndex) {
    const existingDefaults = this.getDefaults();
    if (existingDefaults[nodeType]) {
      delete existingDefaults[nodeType][widgetIndex];
      localStorage.setItem(
        EXTENSION_KEY + "_defaults",
        JSON.stringify(existingDefaults)
      );
    }
  }

  addDefaultVal(nodeType, widgetIndex, value) {
    const existingDefaults = this.getDefaults();
    if (!existingDefaults[nodeType]) {
      existingDefaults[nodeType] = {};
    }
    existingDefaults[nodeType][widgetIndex] = value;
    localStorage.setItem(
      EXTENSION_KEY + "_defaults",
      JSON.stringify(existingDefaults)
    );
  }

  getDefaults() {
    const storage = localStorage.getItem(EXTENSION_KEY + "_defaults");
    if (!storage) {
      return {};
    }
    return JSON.parse(storage);
  }

  show() {
    this.dialog.show(this.createDialog());
  }
}
