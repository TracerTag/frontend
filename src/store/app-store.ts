import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  imageUrl: string;
  isLoadingServerData: boolean;
  setImageUrl: (imageUrl: string) => void;
  setIsLoadingServerData: (isLoadingServerData: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools((set) => ({
    imageUrl: "",
    isLoadingServerData: false,
    setImageUrl: (imageUrl: string) => set({ imageUrl }),
    setIsLoadingServerData: (isLoadingServerData: boolean) =>
      set({ isLoadingServerData }),
  })),
);
