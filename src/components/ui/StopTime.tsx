import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { getTimeString, msToTime } from "~/tools/index";
import { EStopTime, StopDepartureStatus, StopTime } from "~/tools/typings";

type Props = {
    stopTime: StopTime;
    darkMode?: boolean;
};

export default ({ stopTime, darkMode }: Props) => {
    const { t } = useTranslation();

    const [color, text, hasDelay] = useMemo(() => {
        if (stopTime[EStopTime.status] === StopDepartureStatus.Cancelled) {
            return [darkMode ? "#e1bee7" : "#4a148c", t("punctuality.cancelled"), true];
        }

        if (stopTime[EStopTime.status] === StopDepartureStatus.Scheduled) {
            return [darkMode ? "#cfd8dc" : "#455a64", t("punctuality.unknown")];
        }

        if (stopTime[EStopTime.delay] && stopTime[EStopTime.delay]! >= 60000) {
            return [
                darkMode ? "#ff8a80" : "#b71c1c",
                t("punctuality.late", { time: msToTime(stopTime[EStopTime.delay]!) }),
                true,
            ];
        }

        if (stopTime[EStopTime.delay] && stopTime[EStopTime.delay]! <= -60000) {
            return [
                darkMode ? "#ffe082" : "#d84315",
                t("punctuality.early", { time: msToTime(-stopTime[EStopTime.delay]!) }),
                true,
            ];
        }

        return [darkMode ? "#c5e1a5" : "#1b5e20", t("punctuality.onTime")];
    }, [stopTime]);

    return (
        <View style={styles.row}>
            <Text variant="labelMedium" style={{ color }}>
                {text}
            </Text>

            <Text variant="labelMedium">·</Text>

            {stopTime[EStopTime.status] !== StopDepartureStatus.Cancelled && (
                <Text variant="labelMedium">
                    {getTimeString(stopTime[EStopTime.scheduledTime] + stopTime[EStopTime.delay])}
                </Text>
            )}

            {hasDelay && (
                <Text variant="labelSmall" style={styles.strikethrough}>
                    {getTimeString(stopTime[EStopTime.scheduledTime])}
                </Text>
            )}

            {stopTime[EStopTime.platform] && (
                <Text variant="labelMedium">
                    · {t("trips.platform", { platform: stopTime[EStopTime.platform] })}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    strikethrough: {
        textDecorationLine: "line-through",
        textShadowColor: "#000",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 1,
    },
});
