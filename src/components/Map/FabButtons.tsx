import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";
import { FAB } from "react-native-paper";

export default () => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { bottom: insets.bottom + 72 }]}>
            <FAB icon="magnify" variant="tertiary" size="small" onPress={() => console.log("Pressed")} />

            <FAB icon="filter-outline" variant="secondary" size="small" onPress={() => console.log("Pressed")} />

            <FAB icon="crosshairs" onPress={() => console.log("Pressed")} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        position: "absolute",
        right: 16,
        gap: 12,
    },
});
