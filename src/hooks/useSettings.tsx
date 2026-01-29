import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { City } from "~/tools/typings";

export type CitiesResponse = {
    hash: string;
    cities?: City[];
};

interface SettingsState {
    showFleet: boolean;
    setShowFleet: (value: boolean) => void;
    showBrigade: boolean;
    setShowBrigade: (value: boolean) => void;
    useStopCode: boolean;
    setUseStopCode: (value: boolean) => void;

    citiesResponse: CitiesResponse | undefined;
    setCitiesResponse: (value: CitiesResponse | undefined) => void;

    currentCity: string | undefined;
    setCurrentCity: (value: string | undefined) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            showFleet: true,
            setShowFleet: (value) => set({ showFleet: value }),
            showBrigade: true,
            setShowBrigade: (value) => set({ showBrigade: value }),
            useStopCode: false,
            setUseStopCode: (value) => set({ useStopCode: value }),

            citiesResponse: undefined,
            setCitiesResponse: (value) => set({ citiesResponse: value }),

            currentCity: undefined,
            setCurrentCity: (value) => set({ currentCity: value }),
        }),
        {
            name: "settings-storage",
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);

export default () => {
    const showFleet = useSettingsStore((state) => state.showFleet);
    const setShowFleet = useSettingsStore((state) => state.setShowFleet);

    const showBrigade = useSettingsStore((state) => state.showBrigade);
    const setShowBrigade = useSettingsStore((state) => state.setShowBrigade);

    const useStopCode = useSettingsStore((state) => state.useStopCode);
    const setUseStopCode = useSettingsStore((state) => state.setUseStopCode);

    return {
        showFleet,
        setShowFleet,
        showBrigade,
        setShowBrigade,
        useStopCode,
        setUseStopCode,
    };
};
