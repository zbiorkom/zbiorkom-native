import { create } from "zustand";
import { Bounds } from "@/tools/protobufTypings";

interface MapViewState {
    bounds: Bounds | null;
    zoom: number | null;
    setView: (view: {
        bounds: [northEast: GeoJSON.Position, southWest: GeoJSON.Position];
        zoom?: number;
    }) => void;
}

export default create<MapViewState>((set) => ({
    bounds: null,
    zoom: null,
    setView: ({ bounds: [[minLon, minLat], [maxLon, maxLat]], zoom }) => {
        set(() => ({
            bounds: { minLon, minLat, maxLon, maxLat },
            zoom: zoom ?? null,
        }));
    },
}));
