import { useRef } from "react";
import dynamic from "next/dynamic";
import {
  DownloadIcon,
  SparklesIcon,
  Trash2Icon,
  Wand2Icon,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { useAppStore } from "~/store/app-store";

const Canvas = dynamic(() => import("./Canvas").then((m) => m.Canvas), {
  ssr: false,
});

const LabelEntry = ({ label }: { label: string }) => {
  return (
    <div className="flex rounded border p-4">
      <img
        src="https://via.placeholder.com/40"
        className="mr-4 aspect-square"
      />
      <span className="font-bold">{label}</span>
    </div>
  );
};

const SideBar = () => {
  const imageUrl = useAppStore((s) => s.imageUrl);
  const setImageUrl = useAppStore((s) => s.setImageUrl);

  const removeImage = () => {
    URL.revokeObjectURL(imageUrl);
    setImageUrl("");
  };

  return (
    <ol role="list" className="flex flex-1 flex-col gap-y-7 p-4">
      <li className="h-72 space-y-4 overflow-y-auto">
        {Array.from({ length: 20 }).map((_, i) => (
          <LabelEntry key={i} label={`Label ${i}`} />
        ))}
      </li>
      <li className="mt-auto">
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

  return (
    <div className="flex flex-1 items-stretch justify-center">
      {/* Main */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-visible px-12 py-9">
        <div className="relative h-auto w-full" ref={containerRef}>
          {/* <Canvas containerRef={containerRef} /> */}
          <img src={imageUrl} />
        </div>
      </div>

      {/* Sidebar */}
      <section className="flex w-72 flex-col overflow-y-auto border-l">
        <SideBar />
      </section>
    </div>
  );
};
