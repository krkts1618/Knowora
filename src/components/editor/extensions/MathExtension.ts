import { Node, mergeAttributes } from "@tiptap/core";
import katex from "katex";

export interface MathOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    math: {
      setInlineMath: (options: { latex: string }) => ReturnType;
      setBlockMath: (options: { latex: string }) => ReturnType;
    };
  }
}

export const InlineMathNode = Node.create<MathOptions>({
  name: "inlineMath",
  group: "inline",
  inline: true,
  selectable: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      latex: {
        default: "E = mc^2",
        parseHTML: (element) => element.getAttribute("data-latex") || "E = mc^2",
        renderHTML: (attributes) => ({
          "data-latex": attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="inline-math"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "inline-math",
        class: "inline-math-node",
      }),
    ];
  },

  renderText({ node }) {
    return `$${node.attrs.latex}$`;
  },

  addCommands() {
    return {
      setInlineMath:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("span");
      dom.className = "inline-math-node";
      dom.setAttribute("data-type", "inline-math");
      dom.setAttribute("data-latex", node.attrs.latex);

      const render = () => {
        try {
          dom.innerHTML = katex.renderToString(node.attrs.latex || "...", {
            throwOnError: false,
            displayMode: false,
          });
        } catch {
          dom.textContent = node.attrs.latex;
        }
      };

      render();

      dom.addEventListener("dblclick", () => {
        const current = node.attrs.latex;
        const newLatex = window.prompt("Edit LaTeX inline equation:", current);
        if (newLatex !== null && typeof getPos === "function") {
          const pos = getPos();
          if (typeof pos === "number") {
            editor
              .chain()
              .setNodeSelection(pos)
              .command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  latex: newLatex.trim() || current,
                });
                return true;
              })
              .run();
          }
        }
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) return false;
          dom.setAttribute("data-latex", updatedNode.attrs.latex);
          try {
            dom.innerHTML = katex.renderToString(updatedNode.attrs.latex || "...", {
              throwOnError: false,
              displayMode: false,
            });
          } catch {
            dom.textContent = updatedNode.attrs.latex;
          }
          return true;
        },
      };
    };
  },
});

export const BlockMathNode = Node.create<MathOptions>({
  name: "blockMath",
  group: "block",
  selectable: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      latex: {
        default: "\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}",
        parseHTML: (element) => element.getAttribute("data-latex") || "",
        renderHTML: (attributes) => ({
          "data-latex": attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="block-math"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "block-math",
        class: "block-math-node",
      }),
    ];
  },

  renderText({ node }) {
    return `$$\n${node.attrs.latex}\n$$`;
  },

  addCommands() {
    return {
      setBlockMath:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.className = "block-math-node group relative";
      dom.setAttribute("data-type", "block-math");
      dom.setAttribute("data-latex", node.attrs.latex);

      const render = () => {
        try {
          dom.innerHTML = katex.renderToString(node.attrs.latex || "...", {
            throwOnError: false,
            displayMode: true,
          });
        } catch {
          dom.textContent = node.attrs.latex;
        }
      };

      render();

      dom.addEventListener("dblclick", () => {
        const current = node.attrs.latex;
        const newLatex = window.prompt("Edit LaTeX block equation:", current);
        if (newLatex !== null && typeof getPos === "function") {
          const pos = getPos();
          if (typeof pos === "number") {
            editor
              .chain()
              .setNodeSelection(pos)
              .command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  latex: newLatex.trim() || current,
                });
                return true;
              })
              .run();
          }
        }
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) return false;
          dom.setAttribute("data-latex", updatedNode.attrs.latex);
          try {
            dom.innerHTML = katex.renderToString(updatedNode.attrs.latex || "...", {
              throwOnError: false,
              displayMode: true,
            });
          } catch {
            dom.textContent = updatedNode.attrs.latex;
          }
          return true;
        },
      };
    };
  },
});
