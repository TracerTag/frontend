import type {
  ElementNode,
  RootNode,
  Node as SvgNode,
  TextNode,
} from "svg-parser";
import { parse } from "svg-parser";

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
  const parsed = parse(
    `<svg xmlns="http://www.w3.org/2000/svg" width="2190" height="1230" baseProfile="tiny" version="1.2"><path fill="none" stroke="#000" d="M834.72 329.895v853.07h369.955v-853.07Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M1264.586 319.862v786.953h274.817V319.862Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M1921.584 376.554v757.208h219.306V376.554Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M329.585 396.905v741.178h221.92V396.905Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M2053.17 308.118v774.61h135.947v-774.61Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M524.992 387.502v736.9h203.442v-736.9Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M739.934 704.306v487.721h224.764v-487.72Z"><desc>bicycle</desc></path><path fill="none" stroke="#000" d="M1279.015 669.06v520.756h214.948V669.059Z"><desc>bicycle</desc></path><path fill="none" stroke="#000" d="M1608.615 369.03v771.776h307.033V369.03Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M488.54 518.456v261.898h147.127V518.456Z"><desc>handbag</desc></path><path fill="none" stroke="#000" d="M1979.094 520.351v180.45h89.806V520.35Z"><desc>backpack</desc></path></svg>`,
  );

  const labels: { path: string; label: string }[] = [];

  if (isElementNode(parsed.children[0])) {
    for (const child of parsed.children[0].children) {
      if (isElementNode(child) && child.tagName === "path") {
        let label = "unknown";

        if (
          isElementNode(child.children[0]) &&
          child.children[0].tagName === "desc" &&
          isNode(child.children[0].children[0]) &&
          child.children[0].children[0].value
        ) {
          label = child.children[0].children[0].value as string;
        }

        labels.push({
          path: child.properties?.d as string,
          label,
        });
      }
    }
  }

  return labels;
};
