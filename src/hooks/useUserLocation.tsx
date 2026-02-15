import { create } from "zustand";
import * as Location from "expo-location";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useMapNavigate } from "./useMapView";
import { Linking } from "react-native";

type LocationState = {
    location: Location.LocationObject | null;
    heading: number | null;
    loading: boolean;
    permissionGranted: boolean | null;
    setLocation: (loc: Location.LocationObject) => void;
    setHeading: (heading: number) => void;
    setLoading: (loading: boolean) => void;
    setPermissionGranted: (granted: boolean) => void;
};

const useLocationStore = create<LocationState>((set) => ({
    location: null,
    heading: null,
    loading: false,
    permissionGranted: null,
    setLocation: (location) => set({ location, loading: false }),
    setHeading: (heading) => set({ heading }),
    setLoading: (loading) => set({ loading }),
    setPermissionGranted: (permissionGranted) => set({ permissionGranted }),
}));

let locationSub: Location.LocationSubscription | null = null;
let headingSub: Location.LocationSubscription | null = null;

const startTracking = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== "granted") {
        return useLocationStore.getState().setPermissionGranted(false);
    }

    useLocationStore.getState().setPermissionGranted(true);
    useLocationStore.getState().setLoading(true);

    if (locationSub) return;

    locationSub = await Location.watchPositionAsync(
        {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 1000,
            distanceInterval: 1,
        },
        (loc) => {
            useLocationStore.getState().setLocation(loc);
        },
    );

    headingSub = await Location.watchHeadingAsync((obj) => {
        useLocationStore.getState().setHeading(obj.magHeading);
    });
};

const stopTracking = () => {
    if (locationSub) locationSub.remove();
    if (headingSub) headingSub.remove();
    locationSub = null;
    headingSub = null;
};

export const useUserLocationData = () => {
    return useLocationStore(
        useShallow((state) => ({
            location: state.location,
            heading: state.heading,
            permissionGranted: state.permissionGranted,
        })),
    );
};

export const useLocationTracking = () => {
    useEffect(() => {
        Location.getForegroundPermissionsAsync().then(({ status }) => {
            if (status === "granted") {
                startTracking();
            }
        });

        return () => {
            stopTracking();
        };
    }, []);
};

export default () => {
    const navigateTo = useMapNavigate();
    const [permissionGranted, location, loading] = useLocationStore(
        useShallow((state) => [state.permissionGranted, state.location, state.loading]),
    );

    const handleFabPress = async () => {
        const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

        if (status === "granted") {
            if (!locationSub) {
                await startTracking();
            }

            if (!location) {
                useLocationStore.getState().setLoading(true);
            } else {
                navigateTo([location.coords.longitude, location.coords.latitude], 15);
            }

            return;
        }

        if (canAskAgain) {
            const { status: newStatus } = await Location.requestForegroundPermissionsAsync();

            if (newStatus === "granted") {
                await startTracking();
            } else {
                useLocationStore.getState().setPermissionGranted(false);
            }
        } else {
            Linking.openSettings();
        }
    };

    return { handleFabPress, loading, permissionGranted, location };
};
