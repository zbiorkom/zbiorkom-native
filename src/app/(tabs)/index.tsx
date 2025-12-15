import { MapView, MapViewRef, MarkerView } from "@maplibre/maplibre-react-native";
import { useTheme } from "~/hooks/useTheme";
import { Host } from "~/hooks/Portal";
import { PixelRatio, Platform, View } from "react-native";
import { useRef } from "react";
import useMapView from "~/hooks/useMapView";
import useMapSheets, { MarkersClicked } from "~/hooks/useMapSheets";
import { useShallow } from "zustand/shallow";
import { darkFilter } from "~/tools/constants";
import mapStyle from "@/Map/mapStyle.json";
import Map from "@/Map";

const pixelRatio = Platform.OS === "android" ? PixelRatio.get() : 1;

export default () => {
    const setMarkersClicked = useMapSheets(useShallow((state) => state.setMarkersClicked));
    const { colorScheme } = useTheme();
    const mapRef = useRef<MapViewRef>(null);
    const setMapView = useMapView((state) => state.setView);
    const touchStart = useRef<{ x: number; y: number }>(null);

    return (
        <View
            style={{ flex: 1 }}
            onTouchStart={({ nativeEvent }) => {
                touchStart.current = {
                    x: nativeEvent.locationX,
                    y: nativeEvent.locationY,
                };
            }}
            onTouchEnd={async ({ nativeEvent }) => {
                if (!touchStart.current) return;
                const { locationX, locationY } = nativeEvent;

                const diffX = Math.abs(touchStart.current.x - locationX);
                const diffY = Math.abs(touchStart.current.y - locationY);

                touchStart.current = null;
                if (diffX || diffY) return;

                const features = await mapRef.current?.queryRenderedFeaturesAtPoint(
                    [locationX * pixelRatio, locationY * pixelRatio],
                    undefined,
                    ["vehicles", "stops"]
                );

                if (!features) return;

                if (features.features.length > 1) {
                    const data: MarkersClicked = [];

                    for (const { properties } of features.features) {
                        if (properties?.type === "vehicle") {
                            data.push({ vehicle: properties.vehicle });
                        } else if (properties?.type === "stop") {
                            data.push({ stop: properties.stop });
                        }
                    }

                    setMarkersClicked(data);
                } else {
                }
            }}
        >
            <MapView
                style={{
                    flex: 1,
                    filter: colorScheme === "dark" ? darkFilter : undefined,
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

            <Map />
        </View>
    );
};
