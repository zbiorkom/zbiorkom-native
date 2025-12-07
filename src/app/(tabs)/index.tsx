import { Images, MapView, MapViewRef, MarkerView } from "@maplibre/maplibre-react-native";
import FabButtons from "@/components/Map/FabButtons";
import { useTheme } from "@/hooks/useTheme";
import { Host } from "@/hooks/Portal";
import { View } from "react-native";
import { useRef } from "react";
import useMapView from "@/hooks/useMapView";
import Markers from "@/components/Markers";
import mapStyle from "@/components/Map/mapStyle.json";

export default () => {
    const { colorScheme } = useTheme();
    const mapRef = useRef<MapViewRef>(null);
    const setMapView = useMapView((state) => state.setView);

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
                mapStyle={mapStyle}
                attributionEnabled={false}
                onRegionDidChange={({ properties }) => {
                    setMapView({
                        bounds: properties.visibleBounds,
                        zoom: properties.zoomLevel,
                    });
                }}
                regionDidChangeDebounceTime={1}
                onDidFinishLoadingMap={async () => {
                    const [bounds, zoom] = await Promise.all([
                        mapRef.current?.getVisibleBounds(),
                        mapRef.current?.getZoom(),
                    ]);

                    if (bounds) setMapView({ bounds, zoom });
                }}
                ref={mapRef}
                rotateEnabled={false}
                pitchEnabled={false}
            >
                <Host host="map" />
                <MarkerView coordinate={[0, 0]} children={<></>} />
            </MapView>

            <Markers />

            <FabButtons />
        </View>
    );
};
