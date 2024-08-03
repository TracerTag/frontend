import type {
  ElementNode,
  RootNode,
  Node as SvgNode,
  TextNode,
} from "svg-parser";
import { parse } from "svg-parser";
import { useAppStore } from "~/store/app-store";

import { colors } from "~/constants/color";
import { type PathInfo } from "~/store/app-store";

const isNode = (node: unknown): node is SvgNode => {
  return isTextNode(node) || isElementNode(node);
};

const isTextNode = (node: unknown): node is TextNode => {
  if (typeof node === "object" && node !== null && "type" in node) {
    const n = node as TextNode;
    return (
      n.type === "text" &&
      (typeof n.value === "string" ||
        typeof n.value === "boolean" ||
        typeof n.value === "number" ||
        n.value === undefined)
    );
  }
  return false;
};

const isElementNode = (node: unknown): node is ElementNode => {
  if (typeof node === "object" && node !== null && "type" in node) {
    const n = node as ElementNode;
    return (
      n.type === "element" &&
      (n.tagName === undefined || typeof n.tagName === "string") &&
      (n.properties === undefined ||
        (typeof n.properties === "object" &&
          !Array.isArray(n.properties) &&
          Object.values(n.properties).every(
            (value) => typeof value === "string" || typeof value === "number",
          ))) &&
      Array.isArray(n.children) &&
      n.children.every((child) => typeof child === "string" || isNode(child)) &&
      (n.value === undefined || typeof n.value === "string") &&
      (n.metadata === undefined || typeof n.metadata === "string")
    );
  }
  return false;
};

const isRootNode = (node: unknown): node is RootNode => {
  if (typeof node === "object" && node !== null && "type" in node) {
    const n = node as RootNode;
    return (
      n.type === "root" &&
      Array.isArray(n.children) &&
      n.children.length === 1 &&
      isNode(n.children[0])
    );
  }
  return false;
};

export const parseServerResponse = (svgBody: string) => {
  const parsed = parse(svgBody);

  const labels: PathInfo[] = [];
  let i = 0;
  const setColors = new Map<string, string>();

  if (isElementNode(parsed.children[0])) {
    for (const child of parsed.children[0].children) {
      if (isElementNode(child) && child.tagName === "path") {
        let label = "unknown";
        let color = colors[i % colors.length] as string;

        if (
          isElementNode(child.children[0]) &&
          child.children[0].tagName === "desc" &&
          isNode(child.children[0].children[0]) &&
          child.children[0].children[0].value
        ) {
          label = child.children[0].children[0].value as string;

          // Check already assigned color
          if (setColors.has(label)) {
            color = setColors.get(label)!;
          } else {
            setColors.set(label, color);
            i++;
          }
        }

        labels.push({
          path: child.properties?.d as string,
          label,
          selected: true,
          color: color,
        });
      }
    }
  }

  return labels;
};
