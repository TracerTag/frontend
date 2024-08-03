import type Konva from "konva";
import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Layer, Path, Stage, Star, Text } from "react-konva";
import {
  ElementNode,
  parse,
  RootNode,
  Node as SvgNode,
  TextNode,
} from "svg-parser";

import { useAppStore } from "~/store/app-store";

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

const parsed = parse(
  `<svg xmlns="http://www.w3.org/2000/svg" width="2190" height="1230" baseProfile="tiny" version="1.2"><path fill="none" stroke="#000" d="M834.72 329.895v853.07h369.955v-853.07Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M1264.586 319.862v786.953h274.817V319.862Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M1921.584 376.554v757.208h219.306V376.554Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M329.585 396.905v741.178h221.92V396.905Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M2053.17 308.118v774.61h135.947v-774.61Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M524.992 387.502v736.9h203.442v-736.9Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M739.934 704.306v487.721h224.764v-487.72Z"><desc>bicycle</desc></path><path fill="none" stroke="#000" d="M1279.015 669.06v520.756h214.948V669.059Z"><desc>bicycle</desc></path><path fill="none" stroke="#000" d="M1608.615 369.03v771.776h307.033V369.03Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M488.54 518.456v261.898h147.127V518.456Z"><desc>handbag</desc></path><path fill="none" stroke="#000" d="M1979.094 520.351v180.45h89.806V520.35Z"><desc>backpack</desc></path></svg>`,
);

interface canvasScaleInitializerProps {
  width: number;
  height: number;
  containerRef: RefObject<HTMLDivElement>;
  shouldFitToWidth?: boolean;
}

interface canvasScaleResizerProps {
  width: number;
  height: number;
  containerWidth: number;
  containerHeight: number;
  shouldFitToWidth?: boolean;
}

const canvasScaleInitializer = ({
  width,
  height,
  containerRef,
  shouldFitToWidth,
}: canvasScaleInitializerProps) => {
  const containerWidth = containerRef.current?.offsetWidth ?? width;
  const containerHeight = containerRef.current?.offsetHeight ?? height;
  return canvasScaleResizer({
    width,
    height,
    containerWidth,
    containerHeight,
    shouldFitToWidth,
  });
};

const canvasScaleResizer = ({
  width,
  height,
  containerWidth,
  containerHeight,
  shouldFitToWidth,
}: canvasScaleResizerProps) => {
  const isMobile = window.innerWidth < 768;
  let scale = 1;
  const xScale = containerWidth / width;
  const yScale = containerHeight / height;
  if (isMobile) {
    scale = Math.max(xScale, yScale);
  } else {
    if (shouldFitToWidth) {
      scale = xScale;
    } else {
      scale = Math.min(xScale, yScale);
    }
  }
  const scaledWidth = scale * width;
  const scaledHeight = scale * height;
  const scalingStyle = {
    transform: `scale(${scale})`,
    transformOrigin: "left top",
  };
  const scaledDimensionsStyle = {
    width: scaledWidth,
    height: scaledHeight,
  };
  return {
    scalingStyle,
    scaledDimensionsStyle,
    scaledWidth,
    scaledHeight,
    containerWidth,
    containerHeight,
  };
};

export { canvasScaleInitializer, canvasScaleResizer };

export const handleImageScale = (data: HTMLImageElement) => {
  const IMAGE_SIZE = 500;
  const UPLOAD_IMAGE_SIZE = 1024;
  const w = data.naturalWidth;
  const h = data.naturalHeight;
  let scale;
  let uploadScale;
  if (h < w) {
    scale = IMAGE_SIZE / h;
    if (h * scale > 1333) {
      scale = 1333 / h;
    }
    uploadScale = UPLOAD_IMAGE_SIZE / w;
  } else {
    scale = IMAGE_SIZE / w;
    if (w * scale > 1333) {
      scale = 1333 / w;
    }
    uploadScale = UPLOAD_IMAGE_SIZE / h;
  }

  console.log(w, h);

  return { height: h, width: w, scale, uploadScale };
};

export const Canvas = ({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement>;
}) => {
  const imageUrl = useAppStore((s) => s.imageUrl);

  const imageClone = useRef(new window.Image());

  const konvaRef = useRef<Konva.Stage>(null);
  const [scale, setScale] = useState<{
    height: number;
    width: number;
    scale: number;
    uploadScale: number;
  }>({
    height: 0,
    width: 0,
    scale: 0,
    uploadScale: 0,
  });

  const [svgPaths, setSvgPaths] = useState<string[]>([]);

  const MAX_CANVAS_AREA = 1677721;
  const w = scale.width;
  const h = scale.height;
  const area = w * h;
  const canvasScale =
    area > MAX_CANVAS_AREA ? Math.sqrt(MAX_CANVAS_AREA / (w * h)) : 1;
  const canvasDimensions = {
    width: Math.floor(w * canvasScale),
    height: Math.floor(h * canvasScale),
  };

  const resizer = canvasScaleInitializer({
    width: canvasDimensions.width,
    height: canvasDimensions.height,
    containerRef,
    shouldFitToWidth: true,
  });
  const [scalingStyle, setScalingStyle] = useState(resizer.scalingStyle);
  const [scaledDimensionsStyle, setScaledDimensionsStyle] = useState(
    resizer.scaledDimensionsStyle,
  );

  useEffect(() => {
    imageClone.current.src = imageUrl;
    imageClone.current.onload = () => {
      setScale(handleImageScale(imageClone.current));
      console.log(handleImageScale(imageClone.current));
    };

    const x = [];

    if (isElementNode(parsed.children[0])) {
      for (const child of parsed.children[0].children) {
        if (isElementNode(child) && child.tagName === "path") {
          x.push(child.properties?.d as string);

          if (
            isElementNode(child.children[0]) &&
            child.children[0].tagName === "desc" &&
            isNode(child.children[0].children[0]) &&
            child.children[0].children[0].value
          ) {
            console.log(child.children[0].children[0].value);
          }
        }
      }
    }

    setSvgPaths(x);
  }, [imageClone, imageUrl]);

  return (
    <Stage
      width={canvasDimensions.width}
      height={canvasDimensions.height}
      ref={konvaRef}>
      <Layer>
        <Image
          x={0}
          y={0}
          image={imageClone.current}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          opacity={1}
          preventDefault={false}
        />
      </Layer>
      <Layer>
        {svgPaths.forEach((v, i) => {
          console.log(v);
          return (
            <Path
              key={i}
              data={v}
              // fill={colors[i % colors.length]}
              // fill={"black"}
              stroke="black"
              strokeWidth={3}
              scaleX={canvasScale / scale.uploadScale}
              scaleY={canvasScale / scale.uploadScale}
              opacity={1}
              lineCap="round"
              lineJoin="round"
              // preventDefault={false}
              // visible={false}
              // visible={true}
            />
          );
        })}
      </Layer>
    </Stage>
  );
};
