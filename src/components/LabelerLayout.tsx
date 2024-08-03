import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  DownloadIcon,
  Loader2Icon,
  SparklesIcon,
  Trash2Icon,
  Wand2Icon,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { PathInfo, useAppStore } from "~/store/app-store";
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

const LabelEntry = ({ path, index }: { path: PathInfo; index: number }) => {
  const imageSize = useAppStore((s) => s.imageSize);
  const setSelected = useAppStore((s) => s.setSelected);
  const [isSelected, setIsSelected] = useState(path.selected);

  const onClick = () => {
    setIsSelected((v) => !v);
    setSelected(index, !path.selected);
  };

  return (
    <div
      className={cn(
        "flex rounded-md border p-2 ring-inset hover:cursor-pointer hover:ring-2 hover:ring-blue-600",
        {
          "ring-1 ring-blue-600": isSelected,
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
          fill="#ff00ff30"
          stroke="magenta"
          stroke-width="50"></path>
      </svg>
      <div className="ml-2 flex flex-col items-center justify-center">
        <span className="font-bold">{path.label}</span>
        {/* <span className="text-xs">Oly gay</span> */}
      </div>
    </div>
  );
};

const SideBar = () => {
  const imageUrl = useAppStore((s) => s.imageUrl);
  const paths = useAppStore((s) => s.paths);
  const clear = useAppStore((s) => s.clear);

  const removeImage = () => {
    URL.revokeObjectURL(imageUrl);
    clear();
  };

  return (
    <ol role="list" className="flex flex-1 flex-col gap-y-7">
      <li className="h-[600px] space-y-4 overflow-y-auto p-4">
        {paths.map((v, i) => (
          <LabelEntry key={i} path={v} index={i} />
        ))}
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
            <Button className="w-full">
              <Wand2Icon className="mr-2 h-5 w-5" /> Extract outlines
            </Button>
          </li>
          <li className="flex gap-2">
            <Button className="flex-1">
              <DownloadIcon className="mr-2 h-5 w-5" /> SVG
            </Button>
            <Button className="flex-1">
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
