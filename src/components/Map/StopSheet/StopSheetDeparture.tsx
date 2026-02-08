import DelayText from "@/ui/DelayText";
import RouteChip from "@/ui/RouteChip";
import { StyleSheet, View } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import { useTheme } from "~/hooks/useTheme";
import { EStopDeparture, ETrip, StopDeparture } from "~/tools/typings";

export default ({ departure }: { departure: StopDeparture }) => {
    const { colorScheme, theme } = useTheme();
    const darkMode = colorScheme === "dark";

    return (
        <TouchableRipple
            style={[styles.container, { backgroundColor: theme.colors.elevation.level3 }]}
            borderless
            onPress={() => {}}
        >
            <>
                <View style={styles.header}>
                    <RouteChip route={departure[EStopDeparture.trip][ETrip.route]} darkMode={darkMode} />

                    <Text variant="titleSmall">{departure[EStopDeparture.trip][ETrip.headsign]}</Text>
                </View>
                <View style={styles.details}>
                    <DelayText
                        delay={departure[EStopDeparture.delay]}
                        status={departure[EStopDeparture.status]}
                        darkMode={darkMode}
                    />
                    <Text>·</Text>
                    <Text>
                        {new Date(departure[EStopDeparture.scheduledDeparture]).toLocaleTimeString("pl", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                </View>
            </>
        </TouchableRipple>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 8,
        padding: 12,
        borderRadius: 16,
        gap: 4,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    details: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
});
