import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  imageUrl: string;
  isLoadingServerData: boolean;
  paths: PathInfo[];
  imageSize: { width: number; height: number };
  setImageUrl: (imageUrl: string) => void;
  setIsLoadingServerData: (isLoadingServerData: boolean) => void;
  setPaths: (paths: PathInfo[]) => void;
  setSelected: (index: number, selected: boolean) => void;
  clear: () => void;
}

export type PathInfo = {
  path: string;
  label: string;
  selected: boolean;
};

export const useAppStore = create<AppState>()(
  devtools((set, get) => ({
    imageUrl: "",
    isLoadingServerData: false,
    paths: [],
    imageSize: { width: 0, height: 0 },
    setImageUrl: (imageUrl: string) => {
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        set({ imageSize: { width: image.width, height: image.height } });
      };
      set({ imageUrl });
    },
    setSelected: (index: number, selected: boolean) => {
      const paths = [...get().paths];
      paths[index]!.selected = selected;
      set({ paths });
    },
    setIsLoadingServerData: (isLoadingServerData: boolean) =>
      set({ isLoadingServerData }),
    setPaths: (paths: PathInfo[]) => set({ paths }),
    clear: () => set({ imageUrl: "", paths: [] }),
  })),
);
