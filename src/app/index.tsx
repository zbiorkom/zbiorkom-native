import { Stack } from "expo-router";
import { View } from "react-native";
import { MapView } from "@maplibre/maplibre-react-native";
import { StatusBar } from "expo-status-bar";
import HomeSheet from "@/components/HomeSheet";
import { useTheme } from "@/hooks/useTheme";

export default function Index() {
    const { colorScheme } = useTheme();

    return (
        <View style={{ flex: 1 }}>
            <MapView
                style={{
                    flex: 1,
                    filter:
                        colorScheme === "dark"
                            ? "invert(1) hue-rotate(180deg) contrast(90%) brightness(90%)"
                            : undefined,
                }}
                mapStyle="https://zbiorkom.live/style.json"
                attributionEnabled={false}
            />

            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <Stack.Screen options={{ headerShown: false }} />
            <HomeSheet />
        </View>
    );
}
