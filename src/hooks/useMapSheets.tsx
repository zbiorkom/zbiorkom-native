import { create } from "zustand";
import { Stop, VehicleType } from "~/tools/typings";

export type MarkersClicked = { vehicle?: VehicleType; stop?: Stop }[];
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
    const push = (type: SheetType) => set(({ stack }) => ({ stack: [...stack, type] }));

    return {
        stack: [],
        setMarkersClicked: (markers: MarkersClicked) => {
            set({ markersClicked: markers });
            push("MarkersClicked");
        },
        setStop: (stop: Stop) => {
            set({ stop });
            push("Stop");
        },
        goBack: () => set(({ stack }) => ({ stack: stack.slice(0, -1) })),
    };
});
