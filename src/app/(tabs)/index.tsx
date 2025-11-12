import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { MapView } from "@maplibre/maplibre-react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/hooks/useTheme";
import DepartureSheet from "@/components/DepartureSheet";
import { Host } from "@/hooks/Portal";

export default function Index() {
    const { colorScheme } = useTheme();
    const { "#": hash } = useLocalSearchParams<{ "#": string }>();

    const isStopSheetOpen = true//hash === "stop";

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
            >
                <Host host="map" />
                {/* <MarkerView coordinate={[21, 52]}>
                    <Text>Test marker</Text>
                </MarkerView> */}
            </MapView>

            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <DepartureSheet open={isStopSheetOpen} />
        </View>
    );
}
