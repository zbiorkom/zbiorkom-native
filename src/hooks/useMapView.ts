import { create } from "zustand";
import { CameraRef } from "@maplibre/maplibre-react-native";
import { Bounds } from "~/tools/typings";

interface MapViewState {
    cameraRef: CameraRef | null;
    bounds: Bounds | null;
    zoom: number | null;
    setView: (view: {
        bounds: [northEast: GeoJSON.Position, southWest: GeoJSON.Position];
        zoom?: number;
    }) => void;
    setCameraRef: (ref: CameraRef | null) => void;
    navigateTo: (locaiton: GeoJSON.Position, zoom?: number) => void;
}

const useMapView = create<MapViewState>((set, get) => ({
    cameraRef: null,
    bounds: null,
    zoom: null,
    setView: ({ bounds: [[maxLon, maxLat], [minLon, minLat]], zoom }) => {
        set(() => ({
            bounds: [minLon, minLat, maxLon, maxLat],
            zoom: zoom ?? null,
        }));
    },
    setCameraRef: (ref) => set({ cameraRef: ref }),
    navigateTo: (location, zoom) => {
        get().cameraRef?.setCamera({
            centerCoordinate: location,
            zoomLevel: zoom,
            animationDuration: 300,
        });

        setTimeout(() => get().cameraRef?.setCamera({}), 10);
    },
}));

export const useMapNavigate = () => {
    return useMapView((state) => state.navigateTo);
};

export default useMapView;
