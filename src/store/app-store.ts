import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppOptions {
  showImageUnder: boolean;
  editMode: boolean;
}

interface AppState {
  imageUrl: string;
  isLoadingServerData: boolean;
  paths: PathInfo[];
  manualPaths: PathManualInfo[];
  imageSize: { width: number; height: number };
  options: AppOptions;
  setImageUrl: (imageUrl: string) => void;
  setIsLoadingServerData: (isLoadingServerData: boolean) => void;
  setPaths: (paths: PathInfo[]) => void;
  setSelected: (index: number, selected: boolean) => void;
  clear: () => void;
  clearPaths: () => void;
  setManualPaths: (paths: PathManualInfo[]) => void;
  setManualPathsSelected: (index: number, selected: boolean) => void;

  // Options
  showImageUnder: () => void;
  hideImageUnder: () => void;
  toggleImageUnder: () => void;

  enableEditMode: () => void;
  disableEditMode: () => void;
  toggleEditMode: () => void;

  // Drawing
  isDrawing: boolean;
  toggleIsDrawing: () => void;

  editLabel: (index: number, label: string) => void;
}

export type PathInfo = {
  path: string;
  label: string;
  selected: boolean;
  color: string;
};

export type PathManualInfo = {
  points: { x: number; y: number }[];
  label: string;
  selected: boolean;
  color: string;
};

export type JSONAnnotation = {
  width: number;
  height: number;
  objects: JSONAnnotatedObject[];
};

export type JSONAnnotatedObject = {
  object_class: string;
  points: [number, number][];
};

export const useAppStore = create<AppState>()(
  devtools((set) => ({
    imageUrl: "",
    isLoadingServerData: false,
    paths: [],
    imageSize: { width: 0, height: 0 },
    options: {
      showImageUnder: true,
      editMode: false,
    },
    setImageUrl: (imageUrl: string) => {
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        set({ imageSize: { width: image.width, height: image.height } });
      };
      set({ imageUrl });
    },
    setSelected: (index: number, selected: boolean) =>
      set((state) => ({
        paths: state.paths.map((path, i) => {
          if (i === index) {
            return { ...path, selected };
          }
          return path;
        }),
      })),
    setIsLoadingServerData: (isLoadingServerData: boolean) =>
      set({ isLoadingServerData }),
    setPaths: (paths: PathInfo[]) => set({ paths }),
    clear: () =>
      set({
        imageUrl: "",
        paths: [],
        manualPaths: [],
        options: { showImageUnder: true, editMode: false },
      }),
    showImageUnder: () => {
      set((state) => ({
        options: {
          ...state.options,
          showImageUnder: true,
        },
      }));
    },
    hideImageUnder: () => {
      set((state) => ({
        options: {
          ...state.options,
          showImageUnder: false,
        },
      }));
    },
    toggleImageUnder: () => {
      set((state) => ({
        options: {
          ...state.options,
          showImageUnder: !state.options.showImageUnder,
        },
      }));
    },
    enableEditMode: () => {
      set((state) => ({
        options: {
          ...state.options,
          editMode: true,
        },
      }));
    },
    disableEditMode: () => {
      set((state) => ({
        options: {
          ...state.options,
          editMode: true,
        },
      }));
    },
    toggleEditMode: () => {
      set((state) => ({
        options: {
          ...state.options,
          editMode: !state.options.editMode,
        },
      }));
    },

    // Drawing
    isDrawing: false,
    toggleIsDrawing: () => set((state) => ({ isDrawing: !state.isDrawing })),
    manualPaths: [],
    setManualPaths: (manualPaths: PathManualInfo[]) => set({ manualPaths }),
    setManualPathsSelected: (index: number, selected: boolean) =>
      set((state) => ({
        manualPaths: state.manualPaths.map((path, i) => {
          if (i === index) {
            return { ...path, selected };
          }
          return path;
        }),
      })),

    editLabel: (index: number, label: string) =>
      set((state) => ({
        paths: state.paths.map((path, i) => {
          if (i === index) {
            return { ...path, label };
          }
          return path;
        }),
      })),
      clearPaths: () => 
        set({
          paths: [],
          manualPaths: [],
        }),
  })),
);
