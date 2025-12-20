import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useMMKVObject, useMMKVString } from "react-native-mmkv";
import * as SplashScreen from "expo-splash-screen";
import { Button, Text } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { Agency, City } from "~/tools/typings";
import { useTheme } from "./useTheme";
import { apiBase } from "~/tools/constants";

type CitiesResponse = {
    hash: string;
    cities?: City[];
};

type BackendContextValue = {
    cities: City[];
    agencies: Record<string, Agency>;
    currentCity?: string;
    setCurrentCity: (cityId: string) => void;
};

const BackendContext = createContext<BackendContextValue | null>(null);

const fetchCities = async (previousHash?: string) => {
    const signal = new AbortController();
    const timer = setTimeout(() => signal.abort(), 5000);

    return fetch(apiBase + (previousHash ? `?hash=${previousHash}` : ""), {
        signal: signal.signal,
    })
        .then((res) => res.json() as Promise<CitiesResponse>)
        .catch(() => null)
        .finally(() => clearTimeout(timer));
};

export const BackendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cities, setCities] = useMMKVObject<CitiesResponse>("cities");
    const [currentCity, setCurrentCity] = useMMKVString("city");
    const { theme } = useTheme();

    const [isReady, setIsReady] = useState(false);
    const [hasError, setHasError] = useState(false);

    const refetch = useCallback(async () => {
        const response = await fetchCities(cities?.hash);

        if (response?.hash) {
            if (response.cities) {
                setCities(response);
                setHasError(false);

                if (currentCity && !response.cities.find((city) => city.id === currentCity)) {
                    setCurrentCity(undefined);
                }
            }

            setHasError(false);
        } else {
            setHasError(true);
        }

        setIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
    }, [cities?.hash, currentCity, setCities, setCurrentCity]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const agencies = useMemo(() => {
        const result: Record<string, Agency> = {};

        for (const city of cities?.cities || []) {
            for (const [agencyId, agency] of Object.entries(city.agencies)) {
                result[agencyId] = agency;
            }
        }

        return result;
    }, [cities?.cities]);

    const contextValue = useMemo(
        () => ({ cities: cities?.cities || [], currentCity: currentCity, setCurrentCity, agencies }),
        [cities, currentCity, setCurrentCity, agencies]
    );

    if (!isReady && !hasError) return null;

    if (hasError) {
        return (
            <View style={[styles.fullScreen, { backgroundColor: theme.colors.background }]}>
                <Text variant="titleMedium" style={styles.message}>
                    Serwer jest niedostepny
                </Text>

                <Button
                    mode="contained"
                    onPress={() => {
                        setIsReady(false);
                        setTimeout(() => refetch(), 500);
                    }}
                    disabled={!isReady}
                    loading={!isReady}
                >
                    Spróbuj ponownie
                </Button>
            </View>
        );
    }

    return <BackendContext.Provider value={contextValue}>{children}</BackendContext.Provider>;
};

export const useCities = () => {
    const context = useContext(BackendContext);

    if (!context) {
        throw new Error("useCities must be used within BackendProvider");
    }

    return context.cities;
};

export const useCity = () => {
    const context = useContext(BackendContext);

    if (!context) {
        throw new Error("useCity must be used within BackendProvider");
    }

    const currentCity = useMemo(
        () => context.cities.find((city) => city.id === context.currentCity),
        [context.cities, context.currentCity]
    );

    return [currentCity, context.setCurrentCity] as const;
};

export const useAgencies = () => {
    const context = useContext(BackendContext);

    if (!context) {
        throw new Error("useAgencies must be used within BackendProvider");
    }

    return context.agencies;
};

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    message: {
        textAlign: "center",
        marginTop: 16,
        marginBottom: 8,
    },
});
