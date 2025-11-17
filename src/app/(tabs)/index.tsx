import { MapView } from "@maplibre/maplibre-react-native";
import FabButtons from "@/components/Map/FabButtons";
import { useTheme } from "@/hooks/useTheme";
import { Host } from "@/hooks/Portal";
import { View } from "react-native";

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
            >
                <Host host="map" />
            </MapView>

            <FabButtons />
        </View>
    );
}
