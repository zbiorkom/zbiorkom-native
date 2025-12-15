import { Button, IconButton, Surface } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import DirectionsFormPlace from "./DirectionsFormPlace";
import { useTheme } from "~/hooks/useTheme";

export default () => {
    const { theme } = useTheme();

    return (
        <Surface style={styles.container} mode="flat" elevation={1}>
            <View>
                <View style={styles.fieldsForm}>
                    <DirectionsFormPlace />

                    <DirectionsFormPlace />
                </View>

                <IconButton
                    icon="swap-vertical"
                    mode="contained"
                    containerColor={theme.colors.elevation.level1}
                    iconColor={theme.colors.onSurfaceVariant}
                    style={styles.swapButton}
                    onPress={() => {}}
                />
            </View>

            <View style={styles.actions}>
                <Button
                    mode="contained-tonal"
                    style={[styles.fillButton, { backgroundColor: theme.colors.secondaryContainer }]}
                    labelStyle={{ color: theme.colors.onSecondaryContainer }}
                    onPress={() => {}}
                >
                    Wyjazd: teraz
                </Button>

                <IconButton
                    icon="cog"
                    mode="contained"
                    containerColor={theme.colors.tertiaryContainer}
                    iconColor={theme.colors.onTertiaryContainer}
                    onPress={() => {}}
                />
            </View>
        </Surface>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 16,
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    fillButton: {
        flex: 1,
    },
    fieldsForm: {
        gap: 8,
    },
    swapButton: {
        position: "absolute",
        transform: [{ translateY: -24 }],
        right: -6,
        top: "50%",
        borderRadius: 0,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
});
