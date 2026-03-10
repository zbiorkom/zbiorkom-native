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
    fitBounds: (ne: GeoJSON.Position, sw: GeoJSON.Position, padding?: number) => void;
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
            animationMode: "easeTo",
        });

        setTimeout(() => get().cameraRef?.setCamera({}), 10);
    },
    fitBounds: (ne, sw, padding = 80) => {
        get().cameraRef?.setCamera({
            bounds: { ne, sw },
            padding: {
                paddingLeft: padding,
                paddingRight: padding,
                paddingTop: padding,
                paddingBottom: padding,
            },
            animationDuration: 300,
            animationMode: "easeTo",
        });

        setTimeout(() => get().cameraRef?.setCamera({}), 10);
    },
}));

export const useMapNavigate = () => {
    return useMapView((state) => state.navigateTo);
};

export const useMapFitBounds = () => {
    return useMapView((state) => state.fitBounds);
};

export default useMapView;
