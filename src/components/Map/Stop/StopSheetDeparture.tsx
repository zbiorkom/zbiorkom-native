import Countdown from "@/ui/Countdown";
import RouteChip from "@/ui/RouteChip";
import StopTime from "@/ui/StopTime";
import { StyleSheet, View } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import { useTheme } from "~/hooks/useTheme";
import { EPosition, EStopDeparture, EStopTime, ETrip, StopDeparture, StopDepartureStatus } from "~/tools/typings";
import { useRouter } from "expo-router";

export default ({ departure }: { departure: StopDeparture }) => {
    const router = useRouter();
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
                    const position = departure[EStopDeparture.position]!;
                    router.push({
                        pathname: "/(tabs)/map/trip/[id]",
                        params: {
                            id: position[EPosition.id],
                            city: position[EPosition.city],
                            type: "position",
                        },
                    });
                } else {
                    const trip = departure[EStopDeparture.trip];
                    router.push({
                        pathname: "/(tabs)/map/trip/[id]",
                        params: {
                            id: trip[ETrip.id],
                            city: trip[ETrip.city],
                            type: "trip",
                        },
                    });
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
