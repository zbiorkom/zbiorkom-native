import { Camera, MapView, MapViewRef } from "@maplibre/maplibre-react-native";
import { useTheme } from "~/hooks/useTheme";
import { Host } from "~/hooks/Portal";
import { PixelRatio, Platform, StyleSheet, View } from "react-native";
import { useRef } from "react";
import useMapView from "~/hooks/useMapView";
import { useShallow } from "zustand/shallow";
import { darkFilter } from "~/tools/constants";
import mapStyle from "@/Map/mapStyle.json";
import { useCity } from "~/hooks/useBackend";
import { Slot, useRouter } from "expo-router";
import UserLocationMarker from "@/Map/UserLocationMarker";
import FabButtons from "@/Map/FabButtons";
import { Portal } from "~/hooks/Portal";
import useMapMarkers from "~/hooks/useMapMarkers";
import { EPosition, EStop } from "~/tools/typings";
import type { MarkersClicked } from "~/hooks/useMapMarkers";

const pixelRatio = Platform.select({
    android: PixelRatio.get(),
    default: 1,
});

export default () => {
    const router = useRouter();
    const setMarkersClicked = useMapMarkers((state) => state.setMarkersClicked);

    const [city] = useCity();
    const { colorScheme } = useTheme();
    const mapRef = useRef<MapViewRef>(null);
    const [setMapView, setCameraRef] = useMapView(useShallow((state) => [state.setView, state.setCameraRef]));
    const touchStart = useRef<{ x: number; y: number }>(null);

    return (
        <View style={styles.root}>
            <View
                style={styles.root}
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
                            const position =
                                typeof properties.position === "string"
                                    ? JSON.parse(properties.position)
                                    : properties.position;

                            router.push({
                                pathname: "/(tabs)/map/trip/[id]",
                                params: {
                                    id: position[EPosition.id],
                                    city: position[EPosition.city],
                                    type: "position",
                                },
                            });
                        } else if (properties?.type === "stop") {
                            const stop =
                                typeof properties.stop === "string"
                                    ? JSON.parse(properties.stop)
                                    : properties.stop;

                            router.push({
                                pathname: "/(tabs)/map/stop/[id]",
                                params: {
                                    id: stop[EStop.id],
                                    city: stop[EStop.city],
                                },
                            });
                        }
                    }
                }}
            >
                <MapView
                    style={[styles.root, colorScheme === "dark" && darkFilter]}
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
            </View>

            <Portal host="map">
                <UserLocationMarker />
            </Portal>

            {/* {showGeneralMarkers && <Markers />} */}

            <FabButtons />

            <View style={styles.slotOverlay} pointerEvents="box-none">
                <Slot />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    slotOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
});
