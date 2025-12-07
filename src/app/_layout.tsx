import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { WebSocketProvider } from "@/hooks/useWebsocket";
import { BackendProvider } from "@/hooks/useBackend";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider } from "@/hooks/useTheme";
import { Stack } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <WebSocketProvider>
                <BottomSheetModalProvider>
                    <ThemeProvider>
                        <BackendProvider>
                            <Stack>
                                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            </Stack>
                        </BackendProvider>
                    </ThemeProvider>
                </BottomSheetModalProvider>
            </WebSocketProvider>
        </GestureHandlerRootView>
    );
};
