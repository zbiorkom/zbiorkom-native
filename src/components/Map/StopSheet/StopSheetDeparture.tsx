import DelayText from "@/ui/DelayText";
import RouteChip from "@/ui/RouteChip";
import { StyleSheet, View } from "react-native";
import { MD3Theme, Text, TouchableRipple } from "react-native-paper";
import { useShallow } from "zustand/shallow";
import useMapSheets from "~/hooks/useMapSheets";
import { EStopDeparture, ETrip, StopDeparture } from "~/tools/typings";

type Props = {
    departure: StopDeparture;
    theme: MD3Theme;
    darkMode: boolean;
};

export default ({ departure, theme, darkMode }: Props) => {
    const [setPosition, setTrip] = useMapSheets(useShallow((state) => [state.setPosition, state.setTrip]));

    return (
        <TouchableRipple
            style={[styles.container, { backgroundColor: theme.colors.elevation.level3 }]}
            borderless
            onPress={() => {
                if (departure[EStopDeparture.position]) {
                    setPosition(departure[EStopDeparture.position]!);
                } else {
                    setTrip(departure[EStopDeparture.trip]);
                }
            }}
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
