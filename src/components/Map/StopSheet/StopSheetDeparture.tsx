import Countdown from "@/ui/Countdown";
import RouteChip from "@/ui/RouteChip";
import StopTime from "@/ui/StopTime";
import { StyleSheet, View } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import { useShallow } from "zustand/shallow";
import useMapSheets from "~/hooks/useMapSheets";
import { useTheme } from "~/hooks/useTheme";
import { EStopDeparture, EStopTime, ETrip, StopDeparture, StopDepartureStatus } from "~/tools/typings";

export default ({ departure }: { departure: StopDeparture }) => {
    const [setPosition, setTrip] = useMapSheets(useShallow((state) => [state.setPosition, state.setTrip]));
    const { theme, colorScheme } = useTheme();
    const darkMode = colorScheme === "dark";

    return (
        <TouchableRipple
            style={[styles.container, { backgroundColor: theme.colors.elevation.level3 }]}
            borderless
            onPress={() => {
                if (
                    departure[EStopDeparture.position] &&
                    departure[EStopDeparture.stopTime][EStopTime.status] === StopDepartureStatus.OnTrip
                ) {
                    setPosition(departure[EStopDeparture.position]!);
                } else {
                    setTrip(departure[EStopDeparture.trip]);
                }
            }}
        >
            <>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <RouteChip route={departure[EStopDeparture.trip][ETrip.route]} darkMode={darkMode} />

                        <Text variant="titleSmall" style={{ flex: 1 }} numberOfLines={1}>
                            {departure[EStopDeparture.trip][ETrip.headsign]}
                        </Text>
                    </View>

                    <StopTime stopTime={departure[EStopDeparture.stopTime]} darkMode={darkMode} />
                </View>

                <Countdown
                    timestamp={
                        departure[EStopDeparture.stopTime][EStopTime.scheduledTime] +
                        departure[EStopDeparture.stopTime][EStopTime.delay]
                    }
                />
            </>
        </TouchableRipple>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 4,
        padding: 12,
        borderRadius: 16,
    },
    content: {
        flexDirection: "column",
        gap: 4,
        flex: 1,
        paddingRight: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});
