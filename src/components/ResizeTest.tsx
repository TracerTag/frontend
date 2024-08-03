import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Konva from "konva";
import { Layer, Path, Stage } from "react-konva";

import { parseServerResponse } from "~/lib/svg-parser";
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
  const imageUrl = useAppStore((state) => state.imageUrl);
  const paths = useAppStore((state) => state.paths);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [data, setData] = useState({
    scalingStyle: {},
    scaledDimensionsStyle: {},
    scaledWidth: 0,
    scaledHeight: 0,
    containerWidth: 0,
    containerHeight: 0,
  });

  useEffect(() => {
    const image = imageRef.current;
    if (!image) {
      return;
    }

    const handleLoad = () => {
      setImageLoaded(true);
    };

    const handleLoadStart = () => {
      setImageLoaded(false);
    };

    image.addEventListener("load", handleLoad);
    image.addEventListener("loadstart", handleLoadStart);

    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("loadstart", handleLoadStart);
    };
  }, []);

  const canvasDimensions = useMemo(() => {
    if (!imageRef.current) {
      return { width: 0, height: 0, scale: 1 };
    }

    if (!imageLoaded) {
      return { width: 0, height: 0, scale: 1 };
    }

    const MAX_CANVAS_AREA = 1677721;
    const w = imageRef.current.naturalWidth;
    const h = imageRef.current.naturalHeight;
    const area = w * h;
    const canvasScale =
      area > MAX_CANVAS_AREA ? Math.sqrt(MAX_CANVAS_AREA / (w * h)) : 1;
    return {
      width: Math.floor(w * canvasScale),
      height: Math.floor(h * canvasScale),
      scale: canvasScale,
    };
  }, [imageRef, imageLoaded]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        const data = canvasScaleR({
          width: canvasDimensions?.width ?? 0,
          height: canvasDimensions?.height ?? 0,
          containerWidth: width,
          containerHeight: height,
        });

        setData(data);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, [canvasDimensions]);

  // const labels = useMemo(() => {
  //   return parseServerResponse(svgMock);
  // }, []);

  return (
    <div className="relative h-full w-full p-8" ref={containerRef}>
      <div className="absolute left-1/2 top-1/2 h-auto w-auto -translate-x-1/2 -translate-y-1/2">
        <div className="relative" style={data.scaledDimensionsStyle}>
          <img
            ref={imageRef}
            src={imageUrl}
            className="absolute h-full w-full"
          />
          <Stage
            ref={stageRef}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            style={data.scalingStyle}>
            <Layer>
              {paths.map((label, i) => (
                <Path
                  key={i}
                  data={label.path}
                  lineCap="round"
                  lineJoin="round"
                  stroke="magenta"
                  fill="#ff00ff30"
                  scaleX={canvasDimensions.scale}
                  scaleY={canvasDimensions.scale}
                  strokeWidth={5}
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};
