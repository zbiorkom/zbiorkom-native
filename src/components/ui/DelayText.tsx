import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native-paper";
import { msToTime } from "~/tools/index";
import { StopDepartureStatus } from "~/tools/typings";

type Props = {
    delay?: number;
    status?: StopDepartureStatus;
    darkMode?: boolean;
};

export default ({ delay, status, darkMode }: Props) => {
    const { t } = useTranslation("punctuality");

    const [color, text] = useMemo(() => {
        if (status === StopDepartureStatus.Cancelled) {
            return [darkMode ? "#e1bee7" : "#4a148c", t("cancelled")];
        } else if (status === StopDepartureStatus.Scheduled || !delay) {
            return [darkMode ? "#cfd8dc" : "#455a64", t("unknown")];
        } else if (delay >= 60000) {
            return [darkMode ? "#ff8a80" : "#b71c1c", t("late", { time: msToTime(delay) })];
        } else if (delay <= -60000) {
            return [darkMode ? "#ffe082" : "#d84315", t("early", { time: msToTime(-delay) })];
        }

        return [darkMode ? "#c5e1a5" : "#1b5e20", t("onTime")];
    }, [delay, status]);

    return (
        <Text variant="labelMedium" style={{ color }}>
            {text}
        </Text>
    );
};
