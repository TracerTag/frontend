import { useRef } from "react";
import dynamic from "next/dynamic";
import { Trash2Icon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useAppStore } from "~/store/app-store";

const Canvas = dynamic(() => import("./Canvas").then((m) => m.Canvas), {
  ssr: false,
});

const SideBar = () => {
  const imageUrl = useAppStore((s) => s.imageUrl);
  const setImageUrl = useAppStore((s) => s.setImageUrl);

  const removeImage = () => {
    URL.revokeObjectURL(imageUrl);
    setImageUrl("");
  };

  return (
    <div className="p-4">
      <Button className="w-full" onClick={removeImage}>
        <Trash2Icon className="mr-2 h-5 w-5" /> Remove image
      </Button>
    </div>
  );
};

export const LabelerLayout = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-1 items-stretch justify-center">
      {/* Main */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-visible px-12 py-9">
        <div className="relative h-auto w-full" ref={containerRef}>
          <Canvas containerRef={containerRef} />
        </div>
      </div>

      {/* Sidebar */}
      <section className="flex w-72 flex-col overflow-y-auto border-l">
        <SideBar />
      </section>
    </div>
  );
};
