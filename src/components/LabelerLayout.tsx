import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  PencilIcon,
  PencilOffIcon,
  SparklesIcon,
  Trash2Icon,
  UploadIcon,
  Wand2Icon,
  XIcon,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { parseServerResponse } from "~/lib/svg-parser";
import {
  JSONAnnotatedObject,
  JSONAnnotation,
  PathInfo,
  useAppStore,
} from "~/store/app-store";
import { cn } from "~/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const ResizeTest = dynamic(
  () => import("./ResizeTest").then((m) => m.ResizeTest),
  {
    ssr: false,
  },
);

const LabelEntry = ({
  path,
  index,
  isManual,
}: {
  path: PathInfo;
  index: number;
  isManual: boolean;
}) => {
  const imageSize = useAppStore((s) => s.imageSize);
  const setSelected = useAppStore((s) => s.setSelected);
  const setManualPathsSelected = useAppStore((s) => s.setManualPathsSelected);
  const [label, setLabel] = useState(path.label);
  const editLabel = useAppStore((s) => s.editLabel);

  useEffect(() => {
    editLabel(index, label);
  }, [editLabel, index, label]);

  const onClick = () => {
    if (!isManual) {
      setSelected(index, !path.selected);
    } else {
      setManualPathsSelected(index, !path.selected);
    }
  };

  return (
    <div
      className={cn(
        "flex rounded-md border p-2 ring-inset hover:cursor-pointer hover:ring-2 hover:ring-blue-600",
        {
          "ring-1 ring-blue-600": path.selected,
        },
      )}
      onClick={onClick}>
      {/* <img
        src={`<svg width="${imageSize.width}" height="${imageSize.width}"><path d="${path}" fill="none" stroke="black" stroke-width="1"></path></svg>`}
        className="mr-4 aspect-square"
      /> */}
      <svg
        viewBox={`0 0 ${imageSize.width} ${imageSize.width}`}
        className="h-24 w-24">
        <path
          d={path.path}
          stroke={path.selected ? path.color : "#3f3f46"}
          fill={path.selected ? `${path.color}30` : "#3f3f4630"}
          stroke-width="50"></path>
      </svg>
      <div className="ml-2 flex flex-1 flex-col items-center justify-center">
        <input
          className="w-full font-bold"
          size={1}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        {/* <span className="text-xs">Oly gay</span> */}
      </div>
    </div>
  );
};

const SideBar = () => {
  const imageUrl = useAppStore((s) => s.imageUrl);
  const paths = useAppStore((s) => s.paths);
  const manualPaths = useAppStore((s) => s.manualPaths);
  const clear = useAppStore((s) => s.clear);
  const imageSize = useAppStore((s) => s.imageSize);
  const setImageUrl = useAppStore((s) => s.setImageUrl);
  const clearPaths = useAppStore((s) => s.clearPaths);
  const setPaths = useAppStore((s) => s.setPaths);

  const removeImage = () => {
    URL.revokeObjectURL(imageUrl);
    clear();
  };

  // Function to download some generic data
  const downloadData = (data: string, type: string, filename: string) => {
    // Download the SVG
    const blob = new Blob([data], { type: type });

    // Use a temporary 'a' element to download the data
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("download", filename);
    a.setAttribute("href", url);
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportSVG = () => {
    // We create a valid SVG taking only the selected paths
    // variable for the namespace
    const svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns, "svg");
    svg.setAttributeNS(svgns, "width", imageSize.width.toString());
    svg.setAttributeNS(svgns, "height", imageSize.height.toString());
    svg.setAttribute("xmlns", svgns);

    for (const path of paths) {
      // Get the currently processed element
      if (path.selected) {
        // Create the path element
        const pathElement = document.createElementNS(svgns, "path");
        pathElement.setAttributeNS(svgns, "d", path.path);
        pathElement.setAttributeNS(svgns, "fill", "none");
        pathElement.setAttributeNS(svgns, "stroke", "black");
        pathElement.setAttributeNS(svgns, "stroke-width", "1");

        // Create the description attribute and add it to the path element
        const descriptionElement = document.createElementNS(svgns, "desc");
        descriptionElement.textContent = path.label;
        pathElement.appendChild(descriptionElement);

        svg.appendChild(pathElement);
      }
    }

    downloadData(svg.outerHTML, "image/svg+xml", "annotations.svg");
  };

  const exportJSON = () => {
    const jsonObject: JSONAnnotation = {
      width: imageSize.width,
      height: imageSize.height,
      objects: [],
    };

    for (const path of paths) {
      if (!path.selected) {
        continue;
      }

      const current_object: JSONAnnotatedObject = {
        object_class: path.label,
        points: [],
      };

      const cleanedPath = path.path.replace("M ", "").replace("Z ", "").trim();

      const pointsTuples = cleanedPath.split(" ");

      for (const pointTuple of pointsTuples) {
        const coords = pointTuple.split(",");
        if (coords.length < 2) {
          continue;
        }
        current_object.points.push([Number(coords[0]), Number(coords[1])]);
      }

      jsonObject.objects.push(current_object);
    }

    downloadData(
      JSON.stringify(jsonObject),
      "application/json",
      "annotations.json",
    );
  };

  const importOutlinesRef = useRef<HTMLInputElement>(null);

  const fileUploadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return;
    }
    clearPaths();
    const uploadedFile = uploadedFiles[0]!;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        console.log(e.target.result);

        if (typeof e.target.result !== "string") {
          return;
        }

        const svgImage = atob(
          e.target.result.toString().replace("data:image/svg+xml;base64,", ""),
        );

        const labels = parseServerResponse(svgImage);

        setPaths(labels);
      }
    };
    reader.readAsDataURL(uploadedFile);
  };

  const fileUploadButtonClick = (e: React.MouseEvent<HTMLElement>) => {
    importOutlinesRef.current?.click();
  };

  return (
    <ol role="list" className="flex flex-1 flex-col gap-y-7">
      <li className="h-[600px] space-y-4 overflow-y-auto p-4">
        {paths.map((v, i) => (
          <LabelEntry key={i} path={v} index={i} isManual={false} />
        ))}
        {manualPaths.map((v, i) => {
          const path: PathInfo = {
            selected: v.selected,
            color: v.color,
            label: v.label,
            path:
              v.points
                .map((c, i) => (i ? `${c.x} ${c.y}` : `M${c.x} ${c.y}`))
                .join(" ") + "Z",
          };

          return (
            <LabelEntry key={"manual" + i} path={path} index={i} isManual />
          );
        })}
      </li>
      <li className="mt-auto p-4">
        <ul role="list" className="space-y-2">
          <li>
            <Button
              variant="secondary"
              className="w-full"
              onClick={removeImage}>
              <Trash2Icon className="mr-2 h-5 w-5" /> Remove image
            </Button>
          </li>
          <li>
            <input
              type="file"
              hidden
              ref={importOutlinesRef}
              onChange={fileUploadInputChange}
              accept=".svg"
            />
            <Button className="w-full" onClick={fileUploadButtonClick}>
              <UploadIcon className="mr-2 h-5 w-5" /> Import outlines
            </Button>
          </li>
          <li className="flex gap-2">
            <Button className="flex-1" onClick={exportSVG}>
              <DownloadIcon className="mr-2 h-5 w-5" /> SVG
            </Button>
            <Button className="flex-1" onClick={exportJSON}>
              <DownloadIcon className="mr-2 h-5 w-5" /> JSON
            </Button>
          </li>
        </ul>
      </li>
    </ol>
  );
};

export const LabelerLayout = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageUrl = useAppStore((s) => s.imageUrl);
  const isLoadingServerData = useAppStore((s) => s.isLoadingServerData);

  const options = useAppStore((s) => s.options);
  const toggleShowUnder = useAppStore((s) => s.toggleImageUnder);
  const toggleEditMode = useAppStore((s) => s.toggleEditMode);
  const clearPaths = useAppStore((s) => s.clearPaths);

  return (
    <>
      <div className="flex flex-1 items-stretch justify-center">
        {/* Main */}
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-visible px-12 py-9">
          {/* <div className="relative h-auto w-full" ref={containerRef}>

            <img src={imageUrl} />
          </div> */}
          <ResizeTest />
        </div>

        {/* Sidebar */}
        <section className="flex w-72 flex-col overflow-y-auto border-l">
          <SideBar />
        </section>
      </div>

      <footer className="fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 rounded-full bg-gray-300">
        <div className="flex gap-2 p-2">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={toggleShowUnder}>
            {options.showImageUnder ? (
              <EyeOffIcon className="h-6 w-6" />
            ) : (
              <EyeIcon className="h-6 w-6" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={toggleEditMode}>
            {options.editMode ? (
              <PencilOffIcon className="h-6 w-6" />
            ) : (
              <PencilIcon className="h-6 w-6" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={clearPaths}>
            <XIcon className="h-6 w-6" />
          </Button>
        </div>
      </footer>

      <AlertDialog open={isLoadingServerData}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-center gap-4">
              <Loader2Icon className="h-12 w-auto animate-spin" /> Processing
              image...
            </AlertDialogTitle>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
