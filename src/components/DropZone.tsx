"use client";

import type { DropzoneState, FileWithPath } from "react-dropzone";
import { useCallback } from "react";
import { ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { useAppStore } from "~/store/app-store";
import { cn } from "~/utils";

const DropZoneForm = ({ dropzone }: { dropzone: DropzoneState }) => {
  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-center rounded-lg border-2 px-6 py-10",
        dropzone.isDragActive
          ? "border-solid border-blue-600 ring-1 ring-inset ring-blue-600"
          : "border-dashed border-gray-900/25",
      )}
      {...dropzone.getRootProps()}>
      <div className="text-center">
        <ImageIcon
          className="mx-auto h-12 w-12 text-gray-300"
          aria-hidden="true"
        />
        <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
          <label
            htmlFor="file-upload"
            className="text-emyo-gold relative cursor-pointer rounded-md font-semibold focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
            <span>Upload a file</span>
            <input {...dropzone.getInputProps()} />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs leading-5 text-gray-600">PNG, JPG up to 10MB</p>
      </div>
    </div>
  );
};

export const DropZone = () => {
  const setImageUrl = useAppStore((s) => s.setImageUrl);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      // Do something with the files
      console.log(acceptedFiles);

      const file = acceptedFiles[0];
      if (!file) {
        return;
      }

      // Update preview
      const preview = URL.createObjectURL(file);
      console.log(preview);
      setImageUrl(preview);
    },
    [setImageUrl],
  );

  const dropzone = useDropzone({
    maxFiles: 1,
    accept: {
      // "image/*": [],
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
    },
    onDrop,
  });

  return <DropZoneForm dropzone={dropzone} />;
};
