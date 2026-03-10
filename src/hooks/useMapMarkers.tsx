import { create } from "zustand";
import { Position, Stop } from "~/tools/typings";

export type MarkersClicked = { position?: Position; stop?: Stop }[];

interface MapMarkersState {
    markersClicked?: MarkersClicked;
    setMarkersClicked: (markers: MarkersClicked) => void;
    clear: () => void;
}

export default create<MapMarkersState>((set) => ({
    markersClicked: undefined,
    setMarkersClicked: (markers) => set({ markersClicked: markers }),
    clear: () => set({ markersClicked: undefined }),
}));
