import { create } from "zustand";
import { Position, Stop } from "~/tools/typings";

export type MarkersClicked = { position?: Position; stop?: Stop }[];
export type SheetType = "MarkersClicked" | "Stop";

interface MapSheetsState {
    stack: SheetType[];
    markersClicked?: MarkersClicked;
    stop?: Stop;
    setMarkersClicked: (markers: MarkersClicked) => void;
    setStop: (stop: Stop) => void;
    goBack: () => void;
}

export default create<MapSheetsState>((set) => {
    return {
        stack: [],
        setMarkersClicked: (markers: MarkersClicked) => {
            set(({ stack }) => ({ markersClicked: markers, stack: [...stack, "MarkersClicked"] }));
        },
        setStop: (stop: Stop) => {
            set(({ stack }) => ({ stop, stack: [...stack, "Stop"] }));
        },
        goBack: () => set(({ stack }) => ({ stack: stack.slice(0, -1) })),
    };
});
