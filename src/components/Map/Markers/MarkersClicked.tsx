import BottomSheet, { useBottomSheetPadding } from "@/BottomSheet";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import { List, TouchableRipple } from "react-native-paper";
import { useShallow } from "zustand/shallow";
import useMapMarkers from "~/hooks/useMapMarkers";
import PositionMarker from "@/Map/Markers/PositionMarker";
import StopMarker from "@/Map/Markers/StopMarker";
import { useTheme } from "~/hooks/useTheme";
import { darkFilter } from "~/tools/constants";
import useSettings from "~/hooks/useSettings";
import { EPosition, EStop } from "~/tools/typings";
import { useRouter } from "expo-router";

export default () => {
    const { showBrigade, showFleet, useStopCode } = useSettings();
    const { theme, colorScheme } = useTheme();
    const padding = useBottomSheetPadding();
    const router = useRouter();
    const [markersClicked, clear] = useMapMarkers(
        useShallow((state) => [state.markersClicked, state.clear]),
    );

    return (
        <BottomSheet
            open={!!markersClicked}
            backdrop
            onClose={() => clear()}
        >
            <BottomSheetScrollView contentContainerStyle={[padding, styles.container]}>
                {markersClicked?.map((marker, index) => {
                    if (marker.position) {
                        const position =
                            typeof marker.position === "string"
                                ? JSON.parse(marker.position)
                                : marker.position;

                        return (
                            <TouchableRipple
                                key={`marker-clicked-ripple-${index}`}
                                borderless
                                onPress={() => {
                                    clear();
                                    router.push({
                                        pathname: "/(tabs)/map/trip/[id]",
                                        params: {
                                            id: position[EPosition.id],
                                            city: position[EPosition.city],
                                            type: "position",
                                        },
                                    });
                                }}
                                style={[
                                    styles.button,
                                    styles.vehicleButton,
                                    { backgroundColor: theme.colors.elevation.level3 },
                                ]}
                            >
                                <PositionMarker
                                    position={position}
                                    showBrigade={showBrigade}
                                    showFleet={showFleet}
                                    style={colorScheme === "dark" && darkFilter}
                                />
                            </TouchableRipple>
                        );
                    } else if (marker.stop) {
                        const stop =
                            typeof marker.stop === "string"
                                ? JSON.parse(marker.stop)
                                : marker.stop;

                        return (
                            <TouchableRipple
                                key={`marker-clicked-ripple-${index}`}
                                borderless
                                onPress={() => {
                                    clear();
                                    router.push({
                                        pathname: "/(tabs)/map/stop/[id]",
                                        params: {
                                            id: stop[EStop.id],
                                            city: stop[EStop.city],
                                        },
                                    });
                                }}
                                style={[
                                    styles.button,
                                    styles.stopButton,
                                    { backgroundColor: theme.colors.elevation.level3 },
                                ]}
                            >
                                <List.Item
                                    left={({ style }) => (
                                        <StopMarker
                                            stop={stop}
                                            useStopCode={useStopCode}
                                            style={[style, colorScheme === "dark" && darkFilter]}
                                        />
                                    )}
                                    title={`${stop[EStop.name]} ${stop[EStop.code] || ""}`}
                                    description={
                                        stop[EStop.direction]
                                            ? `➜ ${stop[EStop.direction]}`
                                            : undefined
                                    }
                                    descriptionNumberOfLines={1}
                                    style={{ paddingVertical: 0 }}
                                />
                            </TouchableRipple>
                        );
                    }
                })}
            </BottomSheetScrollView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    button: {
        flexGrow: 1,
        flexBasis: "45%",
        borderRadius: 16,
    },
    stopButton: {
        flexBasis: "100%",
    },
    vehicleButton: {
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
});
