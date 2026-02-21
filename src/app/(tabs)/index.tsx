import { Camera, MapView, MapViewRef } from "@maplibre/maplibre-react-native";
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
import { useCity } from "~/hooks/useBackend";

const pixelRatio = Platform.OS === "android" ? PixelRatio.get() : 1;

export default () => {
    const [setMarkersClicked, setStop, setPosition] = useMapSheets(
        useShallow((state) => [state.setMarkersClicked, state.setStop, state.setPosition]),
    );
    const [city] = useCity();
    const { colorScheme } = useTheme();
    const mapRef = useRef<MapViewRef>(null);
    const [setMapView, setCameraRef] = useMapView(useShallow((state) => [state.setView, state.setCameraRef]));
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
                    ["positions", "stops"],
                );

                if (!features?.features.length) return;

                if (features.features.length > 1) {
                    const data: MarkersClicked = [];

                    for (const { properties } of features.features) {
                        if (properties?.type === "position") {
                            data.push({ position: properties.position });
                        } else if (properties?.type === "stop") {
                            data.push({ stop: properties.stop });
                        }
                    }

                    setMarkersClicked(data);
                } else {
                    const { properties } = features.features[0];

                    if (properties?.type === "position") {
                        setPosition(properties.position);
                    } else if (properties?.type === "stop") {
                        setStop(properties.stop);
                    }
                }
            }}
        >
            <MapView
                style={[{ flex: 1 }, colorScheme === "dark" && darkFilter]}
                mapStyle={Object.assign(mapStyle, { center: city?.location, zoom: 15 })}
                attributionEnabled={false}
                onRegionDidChange={({ properties }) => {
                    setMapView({
                        bounds: properties.visibleBounds,
                        zoom: properties.zoomLevel,
                    });
                }}
                regionDidChangeDebounceTime={0}
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
                <Camera ref={setCameraRef} />
            </MapView>

            <Map />
        </View>
    );
};
