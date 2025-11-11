import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/hooks/useTheme";
import { Stack } from "expo-router";

export default () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <Stack />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
};
