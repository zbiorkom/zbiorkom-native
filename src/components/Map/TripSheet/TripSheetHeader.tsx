import RouteChip from "@/ui/RouteChip";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "~/hooks/useTheme";
import { ETrip, Trip } from "~/tools/typings";

export default ({ trip }: { trip?: Trip }) => {
    const { colorScheme } = useTheme();

    if (!trip) return null;

    return (
        <View style={styles.container}>
            <RouteChip route={trip[ETrip.route]} darkMode={colorScheme === "dark"} />

            <Text variant="titleMedium" numberOfLines={1}>
                {trip[ETrip.headsign]}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});
