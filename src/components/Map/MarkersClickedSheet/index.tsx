import BottomSheet, { useBottomSheetPadding } from "@/BottomSheet";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import { List, TouchableRipple } from "react-native-paper";
import { useShallow } from "zustand/shallow";
import useMapSheets from "~/hooks/useMapSheets";
import VehicleMarker from "../Markers/PositionMarker";
import StopMarker from "../Markers/StopMarker";
import { useTheme } from "~/hooks/useTheme";
import { darkFilter } from "~/tools/constants";
import useSettings from "~/hooks/useSettings";
import { EStop } from "~/tools/typings";

export default ({ open }: { open: boolean }) => {
    const { showBrigade, showFleet, useStopCode } = useSettings();
    const { theme, colorScheme } = useTheme();
    const padding = useBottomSheetPadding();
    const [markersClicked, setStop, setPosition, goBack] = useMapSheets(
        useShallow((state) => [state.markersClicked, state.setStop, state.setPosition, state.goBack]),
    );

    if (!markersClicked) return null;

    return (
        <BottomSheet open={open} backdrop onClose={goBack}>
            <BottomSheetScrollView contentContainerStyle={[padding, styles.container]}>
                {markersClicked?.map((marker, index) => {
                    if (marker.position) {
                        return (
                            <TouchableRipple
                                key={`marker-clicked-ripple-${index}`}
                                borderless
                                onPress={() => setPosition(marker.position!)}
                                style={[
                                    styles.button,
                                    styles.vehicleButton,
                                    { backgroundColor: theme.colors.elevation.level3 },
                                ]}
                            >
                                <VehicleMarker
                                    position={marker.position}
                                    showBrigade={showBrigade}
                                    showFleet={showFleet}
                                    style={colorScheme === "dark" ? { filter: darkFilter } : {}}
                                />
                            </TouchableRipple>
                        );
                    } else if (marker.stop) {
                        return (
                            <TouchableRipple
                                key={`marker-clicked-ripple-${index}`}
                                borderless
                                onPress={() => setStop(marker.stop!)}
                                style={[
                                    styles.button,
                                    styles.stopButton,
                                    { backgroundColor: theme.colors.elevation.level3 },
                                ]}
                            >
                                <List.Item
                                    left={({ style }) => (
                                        <StopMarker
                                            stop={marker.stop!}
                                            useStopCode={useStopCode}
                                            style={[
                                                style,
                                                colorScheme === "dark" ? { filter: darkFilter } : {},
                                            ]}
                                        />
                                    )}
                                    title={`${marker.stop[EStop.name]} ${marker.stop[EStop.code] || ""}`}
                                    description={
                                        marker.stop[EStop.direction]
                                            ? `➜ ${marker.stop[EStop.direction]}`
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
