"use client";

import React from "react";
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";

export interface CustomImageOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customImage: {
      setCustomImage: (options: {
        src: string;
        alt?: string;
        caption?: string;
        alignment?: "left" | "center" | "right";
        width?: string;
      }) => ReturnType;
    };
  }
}

export function ImageComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const { src, alt, caption, alignment = "center", width = "100%" } = node.attrs;

  const alignmentClass =
    alignment === "left"
      ? "justify-start text-left"
      : alignment === "right"
      ? "justify-end text-right"
      : "justify-center text-center";

  return (
    <NodeViewWrapper className={`my-4 flex flex-col ${alignmentClass} group relative`}>
      <div
        className="relative inline-block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]"
        style={{ width: width === "100%" ? "100%" : width, maxWidth: "100%" }}
      >
        {/* Hover / Focus Control Overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 backdrop-blur-xs rounded-lg p-1 flex items-center gap-1 z-10 text-white">
          <button
            type="button"
            onClick={() => updateAttributes({ alignment: "left" })}
            className={`p-1 rounded hover:bg-white/20 transition-colors ${
              alignment === "left" ? "bg-white/30" : ""
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ alignment: "center" })}
            className={`p-1 rounded hover:bg-white/20 transition-colors ${
              alignment === "center" ? "bg-white/30" : ""
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ alignment: "right" })}
            className={`p-1 rounded hover:bg-white/20 transition-colors ${
              alignment === "right" ? "bg-white/30" : ""
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-3 bg-white/20 mx-0.5" />

          {/* Width Pills */}
          <button
            type="button"
            onClick={() => updateAttributes({ width: "50%" })}
            className={`px-1.5 py-0.5 text-[10px] rounded hover:bg-white/20 transition-colors ${
              width === "50%" ? "bg-white/30" : ""
            }`}
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ width: "100%" })}
            className={`px-1.5 py-0.5 text-[10px] rounded hover:bg-white/20 transition-colors ${
              width === "100%" ? "bg-white/30" : ""
            }`}
          >
            100%
          </button>

          <span className="w-px h-3 bg-white/20 mx-0.5" />

          <button
            type="button"
            onClick={deleteNode}
            className="p-1 rounded hover:bg-red-500/40 text-red-300 hover:text-white transition-colors"
            title="Delete Image"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Image element */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ""}
          className="w-full h-auto object-cover rounded-xl block"
          loading="lazy"
        />
      </div>

      {/* Caption */}
      {caption && (
        <span className="block mt-1.5 text-xs text-[var(--text-muted)] italic">
          {caption}
        </span>
      )}
    </NodeViewWrapper>
  );
}

export const CustomImageExtension = Node.create<CustomImageOptions>({
  name: "customImage",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      caption: {
        default: null,
      },
      alignment: {
        default: "center",
      },
      width: {
        default: "100%",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="custom-image"]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const img = el.querySelector("img");
          const caption = el.querySelector("figcaption");
          return {
            src: img?.getAttribute("src"),
            alt: img?.getAttribute("alt"),
            caption: caption?.textContent || null,
            alignment: el.getAttribute("data-alignment") || "center",
            width: el.getAttribute("data-width") || "100%",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "figure",
      mergeAttributes(this.options.HTMLAttributes, {
        "data-type": "custom-image",
        "data-alignment": HTMLAttributes.alignment,
        "data-width": HTMLAttributes.width,
        class: `custom-image-figure text-${HTMLAttributes.alignment}`,
      }),
      [
        "img",
        {
          src: HTMLAttributes.src,
          alt: HTMLAttributes.alt,
          style: `width: ${HTMLAttributes.width || "100%"}`,
        },
      ],
      HTMLAttributes.caption ? ["figcaption", {}, HTMLAttributes.caption] : "",
    ];
  },

  addCommands() {
    return {
      setCustomImage:
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
    return ReactNodeViewRenderer(ImageComponent);
  },
});
