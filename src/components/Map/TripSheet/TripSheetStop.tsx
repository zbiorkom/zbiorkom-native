import Countdown from "@/ui/Countdown";
import StopTime from "@/ui/StopTime";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import { useTheme } from "~/hooks/useTheme";
import { darkFilter } from "~/tools/constants";
import {
    EItineraryStop,
    EStop,
    EStopTime,
    ETripStopTime,
    ItineraryStop,
    TripStopTime,
} from "~/tools/typings";

type Props = {
    index: number;
    stop: ItineraryStop;
    stopTime?: TripStopTime;
    color?: string;
    totalStops: number;
};

export default ({ index, stop, stopTime, color, totalStops }: Props) => {
    const { theme, colorScheme } = useTheme();
    const darkMode = colorScheme === "dark";
    const colorFilter = darkMode ? darkFilter : undefined;

    const isFirst = index === 0;
    const isLast = index === totalStops - 1;

    const [arrival, departure, isSame] = useMemo(() => {
        if (!stopTime) return [undefined, undefined, undefined];

        const arrival = stopTime[ETripStopTime.arrival];
        const departure = stopTime[ETripStopTime.departure];

        return [
            arrival,
            departure,
            departure[EStopTime.scheduledTime] - arrival[EStopTime.scheduledTime] < 45000,
        ];
    }, [stopTime]);

    return (
        <View style={styles.row}>
            <View style={styles.timeline}>
                <View
                    style={[
                        styles.lineSegment,
                        !isFirst && { backgroundColor: color, filter: colorFilter },
                    ]}
                />
                <View
                    style={[
                        styles.dot,
                        { borderColor: color, filter: colorFilter },
                    ]}
                />
                <View
                    style={[
                        styles.lineSegment,
                        !isLast && { backgroundColor: color, filter: colorFilter },
                    ]}
                />
            </View>

            <TouchableRipple
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.elevation.level3 },
                    isFirst && styles.firstStop,
                    isLast && styles.lastStop,
                ]}
                borderless
                onPress={() => {}}
            >
                <>
                    <View style={{ flex: 1 }}>
                        <Text variant="labelLarge">
                            {`${stop[EItineraryStop.stop][EStop.name]} ${stop[EItineraryStop.stop][EStop.code] || ""}`}
                        </Text>

                        {!isSame && arrival && <StopTime stopTime={arrival} darkMode={darkMode} />}
                        {departure && <StopTime stopTime={departure} darkMode={darkMode} />}
                    </View>

                    {departure && (
                        <Countdown
                            timestamp={departure[EStopTime.scheduledTime] + departure[EStopTime.delay]}
                        />
                    )}
                </>
            </TouchableRipple>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
    },
    timeline: {
        width: 40,
        alignItems: "center",
    },
    lineSegment: {
        marginTop: -1,
        marginBottom: -1,
        flex: 1,
        width: 6,
    },
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 2,
        borderRadius: 4,
        padding: 12,
    },
    firstStop: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    lastStop: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 3,
        backgroundColor: "white",
    },
});
