import { create } from "zustand";
import { CameraRef } from "@maplibre/maplibre-react-native";
import { Bounds } from "~/tools/typings";

type CameraPadding = {
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
};

type FitBoundsOptions = {
    padding?: number | CameraPadding;
    zoomLevel?: number;
    animationDuration?: number;
};

interface MapViewState {
    cameraRef: CameraRef | null;
    bounds: Bounds | null;
    zoom: number | null;
    userMovedMap: boolean;
    setView: (view: {
        bounds: [northEast: GeoJSON.Position, southWest: GeoJSON.Position];
        zoom?: number;
    }) => void;
    setCameraRef: (ref: CameraRef | null) => void;
    setUserMovedMap: (value: boolean) => void;
    navigateTo: (locaiton: GeoJSON.Position, zoom?: number) => void;
    fitBounds: (ne: GeoJSON.Position, sw: GeoJSON.Position, options?: FitBoundsOptions) => void;
}

const useMapView = create<MapViewState>((set, get) => ({
    cameraRef: null,
    bounds: null,
    zoom: null,
    userMovedMap: false,
    setView: ({ bounds: [[maxLon, maxLat], [minLon, minLat]], zoom }) => {
        set(() => ({
            bounds: [minLon, minLat, maxLon, maxLat],
            zoom: zoom ?? null,
        }));
    },
    setCameraRef: (ref) => set({ cameraRef: ref }),
    setUserMovedMap: (value) => set({ userMovedMap: value }),
    navigateTo: (location, zoom) => {
        get().cameraRef?.setCamera({
            centerCoordinate: location,
            zoomLevel: zoom,
            animationDuration: 300,
            animationMode: "easeTo",
        });

        setTimeout(() => get().cameraRef?.setCamera({}), 10);
    },
    fitBounds: (ne, sw, options) => {
        const padding = options?.padding ?? 80;
        const cameraOptions: Parameters<CameraRef["setCamera"]>[0] = {
            bounds: { ne, sw },
            padding:
                typeof padding === "number"
                    ? {
                          paddingLeft: padding,
                          paddingRight: padding,
                          paddingTop: padding,
                          paddingBottom: padding,
                      }
                    : padding,
            animationDuration: options?.animationDuration ?? 300,
            animationMode: "easeTo",
            zoomLevel: options?.zoomLevel,
        };

        get().cameraRef?.setCamera(cameraOptions);

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
