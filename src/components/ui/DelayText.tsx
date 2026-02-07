import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native-paper";
import { msToTime } from "~/tools/index";
import { StopDepartureStatus } from "~/tools/typings";

type Props = {
    delay?: number;
    status?: StopDepartureStatus;
    darkMode?: boolean;
}

export default ({ delay, status, darkMode }: Props) => {
    const { t } = useTranslation("punctuality");

    const [color, text] = useMemo(() => {
        if (status === StopDepartureStatus.Cancelled) return ["#fff", t("cancelled")];
        if (status === StopDepartureStatus.Scheduled || !delay) return ["#fff", t("unknown")];

        if (delay >= 60000) return [darkMode ? "#ff6966" : "#ff6966", t("late", { time: msToTime(delay) })];
        if (delay <= -60000) return [darkMode ? "#ff9500" : "#ff9500", t("early", { time: msToTime(-delay) })];

        return [darkMode ? "#65e765" : "#65e765", t("onTime")];
    }, [delay, status]);

    return (
        <Text variant="labelMedium" style={{ color }}>
            {text}
        </Text>
    );
};
