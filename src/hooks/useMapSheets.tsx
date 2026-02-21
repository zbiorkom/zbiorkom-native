import { create } from "zustand";
import { Position, Stop, Trip } from "~/tools/typings";

export type MarkersClicked = { position?: Position; stop?: Stop }[];
export type SheetType = "MarkersClicked" | "Stop" | "Trip";

interface MapSheetsState {
    stack: SheetType[];
    markersClicked?: MarkersClicked;
    stop?: Stop;
    position?: Position;
    trip?: Trip;
    setMarkersClicked: (markers: MarkersClicked) => void;
    setStop: (stop: Stop) => void;
    setPosition: (position: Position) => void;
    setTrip: (trip: Trip) => void;
    goBack: (reset?: boolean) => void;
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
        setPosition: (position: Position) => {
            set(({ stack }) => ({ position, trip: undefined, stack: [...stack, "Trip"] }));
        },
        setTrip: (trip: Trip) => {
            set(({ stack }) => ({ trip, position: undefined, stack: [...stack, "Trip"] }));
        },
        goBack: (reset?: boolean) => {
            set(({ stack }) => ({
                stack: reset ? [] : stack.slice(0, -1).filter((s) => s !== "MarkersClicked"),
            }));
        },
    };
});
