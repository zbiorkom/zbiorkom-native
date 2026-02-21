import { ThemeProvider as NavThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useLocationTracking } from "~/hooks/useUserLocation";
import { ThemeProvider, useTheme } from "~/hooks/useTheme";
import { BackendProvider } from "~/hooks/useBackend";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";

import "../translations/i18n";

SplashScreen.preventAutoHideAsync();

export default () => {
    useLocationTracking();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <BackendProvider>
                    <BottomSheetModalProvider>
                        <AppContent />
                    </BottomSheetModalProvider>
                </BackendProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
};

const AppContent = () => {
    const { theme, colorScheme } = useTheme();

    return (
        <NavThemeProvider
            value={{
                ...(colorScheme === "dark" ? DarkTheme : DefaultTheme),
                colors: {
                    ...(colorScheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
                    background: theme.colors.background,
                    primary: theme.colors.primary,
                    text: theme.colors.onSurface,
                },
            }}
        >
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="welcome" />
                <Stack.Screen name="cityPicker" />
            </Stack>
        </NavThemeProvider>
    );
};
