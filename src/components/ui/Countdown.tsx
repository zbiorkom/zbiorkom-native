import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

type Props = {
    timestamp: number;
    showSeconds?: boolean;
};

export default ({ timestamp, showSeconds = false }: Props) => {
    const { t } = useTranslation("units");
    const [timeLeft, setTimeLeft] = useState<number>(timestamp - Date.now());

    useEffect(() => {
        const updateTimer = () => {
            const difference = timestamp - Date.now();
            setTimeLeft(difference);
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [timestamp]);

    if (timeLeft < -15000) {
        return null;
    }

    if (timeLeft < 15000) {
        return (
            <View style={styles.container}>
                <Text variant="labelLarge" style={styles.counter}>{t("now")}</Text>
            </View>
        );
    }

    let valueToDisplay = 0;
    let unitKey = "minutes";

    const seconds = Math.floor((timeLeft / 1000) % 60);
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));

    if (hours > 0) {
        valueToDisplay = hours;
        unitKey = "hours";
    } else if (minutes > 0) {
        valueToDisplay = minutes;
        unitKey = "minutes";
    } else {
        if (showSeconds) {
            valueToDisplay = seconds;
            unitKey = "seconds";
        } else {
            valueToDisplay = 0;
            unitKey = "minutes";
        }
    }

    return (
        <View style={styles.container}>
            <Text variant="labelLarge" style={styles.counter}>{valueToDisplay}</Text>
            <Text variant="labelSmall">{t(unitKey, { count: valueToDisplay })}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    counter: {
        fontSize: 20,
        fontWeight: "bold"
    },
    container: {
        alignItems: "flex-end",
        justifyContent: "center",
    },
});
