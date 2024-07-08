import { $el } from "../../scripts/ui.js";
import { ComfyDialog } from "../../scripts/ui/dialog.js";

export class DefaultSettingsDialog extends ComfyDialog {
  constructor(extension) {
    super();
    this.extension = extension;
    this.buttons = null;
    this.element = $el(
      "div.comfy-modal",
      {
        parent: document.body,
        style: {
          width: "78vw",
          padding: "1.25rem",
          overflowY: "scroll",
        },
      },
      [
        $el(
          "div.comfy-modal-content",
          {
            style: {
              width: "100%",
            },
          },
          [
            $el("h1", {
              textContent: "Node Default Values",
              style: {
                textAlign: "center",
                color: "var(--content-fg)",
              },
            }),
            $el("div", {
              textContent: "Set custom default values for nodes.",
              style: {
                textAlign: "center",
                color: "var(--descrip-text)",
              },
            }),
            $el("div", {
              textContent: "Add a node to the graph to see it in this table.",
              style: {
                textAlign: "center",
                color: "var(--descrip-text)",
              },
            }),
            $el("div", {
              textContent:
                "This only affects new nodes added manually — Not nodes loaded from workflows.",
              style: {
                textAlign: "center",
                color: "var(--descrip-text)",
              },
            }),
            $el("hr", {
              style: {
                width: "100%",
                color: "var(--content-fg)",
                marginTop: "1.25rem",
              },
            }),
            ...this.createButtons(),
            $el("div", { $: (div) => (this.textElement = div) }),
          ]
        ),
      ]
    );
  }

  createButtons() {
    return (
      this.buttons ?? [
        $el("button.comfyui-button.primary", {
          type: "button",
          textContent: "Close",
          style: {
            margin: "0.5rem 0 0.5rem 0",
            flexDirection: "column",
          },
          onclick: () => this.close(),
        }),
      ]
    );
  }

  close() {
    this.element.style.display = "none";
  }

  show(html) {
    if (typeof html === "string") {
      this.textElement.innerHTML = html;
    } else {
      this.textElement.replaceChildren(
        ...(html instanceof Array ? html : [html])
      );
    }
    this.element.style.display = "flex";
  }
}