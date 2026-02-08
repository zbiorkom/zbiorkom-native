import BottomSheet from "@/BottomSheet";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { StyleSheet, View } from "react-native";
import { List, TouchableRipple } from "react-native-paper";
import { useShallow } from "zustand/shallow";
import useMapSheets from "~/hooks/useMapSheets";
import VehicleMarker from "../Markers/PositionMarker";
import StopMarker from "../Markers/StopMarker";
import { useTheme } from "~/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { darkFilter } from "~/tools/constants";
import useSettings from "~/hooks/useSettings";
import { EStop } from "~/tools/typings";

export default ({ open }: { open: boolean }) => {
    const { showBrigade, showFleet, useStopCode } = useSettings();
    const { theme, colorScheme } = useTheme();
    const { bottom } = useSafeAreaInsets();
    const [markersClicked, setStop, goBack] = useMapSheets(
        useShallow((state) => [state.markersClicked, state.setStop, state.goBack]),
    );

    if (!markersClicked) return null;

    return (
        <BottomSheet open={open} backdrop onClose={goBack}>
            <BottomSheetScrollView>
                <View
                    style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                        padding: 8,
                        paddingBottom: bottom + 8,
                    }}
                >
                    {markersClicked?.map((marker, index) => {
                        if (marker.position) {
                            return (
                                <TouchableRipple
                                    key={`marker-clicked-ripple-${index}`}
                                    borderless
                                    onPress={() => console.log("Pressed vehicle marker ripple")}
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
                </View>
            </BottomSheetScrollView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
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
