import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  imageUrl: string;
  isLoadingServerData: boolean;
  paths: PathInfo[];
  setImageUrl: (imageUrl: string) => void;
  setIsLoadingServerData: (isLoadingServerData: boolean) => void;
  setPaths: (paths: PathInfo[]) => void;
  clear: () => void;
}

export type PathInfo = {
  path: string;
  label: string;
};

export const useAppStore = create<AppState>()(
  devtools((set) => ({
    imageUrl: "",
    isLoadingServerData: false,
    paths: [],
    setImageUrl: (imageUrl: string) => set({ imageUrl }),
    setIsLoadingServerData: (isLoadingServerData: boolean) =>
      set({ isLoadingServerData }),
    setPaths: (paths: PathInfo[]) => set({ paths }),
    clear: () => set({ imageUrl: "", paths: [] }),
  })),
);
