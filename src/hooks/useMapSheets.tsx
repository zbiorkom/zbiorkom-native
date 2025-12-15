import { Stop, Vehicle } from "~/tools/protobufTypings";
import { create } from "zustand";

export type MarkersClicked = ({ vehicle: Vehicle } | { stop: Stop })[];
export type SheetType = "MarkersClicked";

interface MapSheetsState {
    stack: SheetType[];
    markersClicked?: MarkersClicked;
    setMarkersClicked: (markers: MarkersClicked) => void;
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
        goBack: () => set(({ stack }) => ({ stack: stack.slice(0, -1) })),
    };
});
