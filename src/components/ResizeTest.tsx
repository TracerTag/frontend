import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Konva from "konva";

import { useAppStore } from "~/store/app-store";

const isResizeObserverSizeArray = (
  value: ResizeObserverSize | readonly ResizeObserverSize[],
): value is ResizeObserverSize[] => {
  return Array.isArray(value);
};

const canvasScaleR = ({
  width,
  height,
  containerWidth,
  containerHeight,
}: {
  width: number;
  height: number;
  containerWidth: number;
  containerHeight: number;
}) => {
  let scale = 1;
  const widthRatio = containerWidth / width;
  const heightRatio = containerHeight / height;
  scale = Math.min(widthRatio, heightRatio);

  console.log("B", width, height, containerWidth, containerHeight, scale);

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

const handleImageScale = (data: HTMLImageElement) => {
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

export const ResizeTest = () => {
  // const imageUrl = useAppStore((state) => state.imageUrl);

  const containerRef = useRef<HTMLDivElement>(null);

  // const imageClone = useRef(new window.Image());

  // const konvaRef = useRef<Konva.Stage>(null);
  // const [scale, setScale] = useState<{
  //   height: number;
  //   width: number;
  //   scale: number;
  //   uploadScale: number;
  // }>({
  //   height: 0,
  //   width: 0,
  //   scale: 0,
  //   uploadScale: 0,
  // });

  // useEffect(() => {
  //   imageClone.current.src = "/tag.png";
  //   imageClone.current.onload = () => {
  //     setScale(handleImageScale(imageClone.current));
  //     console.log(handleImageScale(imageClone.current));
  //   };
  // }, [imageClone]);

  // const MAX_CANVAS_AREA = 1677721;
  // const w = scale!.width;
  // const h = scale!.height;
  // const area = w * h;
  // const canvasScale =
  //   area > MAX_CANVAS_AREA ? Math.sqrt(MAX_CANVAS_AREA / (w * h)) : 1;
  // const canvasDimensions = {
  //   width: Math.floor(w * canvasScale),
  //   height: Math.floor(h * canvasScale),
  // };
  // console.log("A", canvasDimensions.width, canvasDimensions.height);

  // const [scaledDimensionsStyle, setScaledDimensionsStyle] = useState(
  //   resizer.scaledDimensionsStyle,
  // );

  // const resizeObserver = new ResizeObserver((entries) => {
  //   for (const entry of entries) {
  //     if (entry.target === containerRef.current) {
  //       let width;
  //       let height;
  //       if (entry.contentBoxSize) {
  //         // Firefox implements `contentBoxSize` as a single content rect, rather than an array
  //         const contentBoxSize = (
  //           isResizeObserverSizeArray(entry.contentBoxSize)
  //             ? entry.contentBoxSize[0]!
  //             : entry.contentBoxSize
  //         ) as ResizeObserverSize;
  //         width = contentBoxSize.inlineSize;
  //         height = contentBoxSize.blockSize;
  //       } else {
  //         width = entry.contentRect.width;
  //         height = entry.contentRect.height;
  //       }

  //       const data = canvasScaleR({
  //         width: canvasDimensions.width,
  //         height: canvasDimensions.height,
  //         containerWidth: width,
  //         containerHeight: height,
  //       });

  //       console.log(data);
  //       // setCanvasWidth(resized.scaledWidth);
  //       // setCanvasHeight(resized.scaledHeight);
  //       // setScaledDimensionsStyle(resized.scaledDimensionsStyle);
  //       // setScalingStyle(resized.scalingStyle);
  //     }
  //   }
  // });

  // useEffect(() => {
  //   const container = containerRef.current;

  //   // setCanvasScale(canvasScale);
  //   // setCanvasWidth(resizer.scaledWidth);
  //   // setCanvasHeight(resizer.scaledHeight);
  //   if (container) {
  //     resizeObserver.observe(container);
  //   }
  //   return () => {
  //     if (container) {
  //       resizeObserver.unobserve(container);
  //     }
  //   };
  // }, []);

  return (
    <div className="relative h-full w-full bg-red-500 p-8" ref={containerRef}>
      <div className="absolute left-1/2 top-1/2 h-auto w-auto -translate-x-1/2 -translate-y-1/2">
        <div className="Canvas relative" style={{}}>
          <img src="/sample.png" className="absolute h-full w-full" />
        </div>
      </div>
    </div>
  );
};
