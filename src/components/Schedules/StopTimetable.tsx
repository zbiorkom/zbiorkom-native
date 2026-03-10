import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "~/hooks/useTheme";

interface StopTimetableProps {
    hourGroups: { hour: number; minutes: { minute: number; tripIdx: number }[] }[];
    onTripSelect: (tripIdx: number) => void;
}

// FIXME: AI SLOP

export default ({ hourGroups, onTripSelect }: StopTimetableProps) => {
    const { theme } = useTheme();

    if (hourGroups.length === 0) return null;

    return (
        <View style={styles.container}>
            {hourGroups.map(({ hour, minutes }, i) => (
                <View
                    key={hour}
                    style={[
                        styles.row,
                        { backgroundColor: theme.colors.elevation.level2 },
                        i === 0 && styles.firstRow,
                        i === hourGroups.length - 1 && styles.lastRow,
                    ]}
                >
                    <Text variant="titleMedium" style={[styles.hour, { color: theme.colors.primary }]}>
                        {hour}
                    </Text>
                    <View style={styles.minutes}>
                        {minutes.map(({ minute, tripIdx }, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => onTripSelect(tripIdx)}
                                style={{ minWidth: 28 }}
                            >
                                <Text variant="bodyMedium" style={{ color: theme.colors.onBackground }}>
                                    {minute.toString().padStart(2, "0")}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 16,
        gap: 2,
    },
    firstRow: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    lastRow: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    row: {
        flexDirection: "row",
        borderRadius: 4,
        paddingVertical: 10
    },
    hour: {
        width: 40,
        marginTop: -2,
        fontWeight: "bold",
        textAlign: "center",
    },
    minutes: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        paddingLeft: 8,
    },
});
