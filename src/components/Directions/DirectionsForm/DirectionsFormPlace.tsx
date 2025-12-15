import { Text, TouchableRipple } from "react-native-paper";
import { useTheme } from "~/hooks/useTheme";
import { StyleSheet, View } from "react-native";

export default () => {
    const { theme } = useTheme();

    return (
        <TouchableRipple
            onPress={() => console.log("Pressed")}
            borderless
            style={[styles.container, { backgroundColor: theme.colors.elevation.level2 }]}
            rippleColor={theme.colors.onSurfaceVariant + "33"}
        >
            <View>
                <Text variant="bodyMedium">Liceum nr 1</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    ul. Szkolna 5, 00-000 Miasto
                </Text>
            </View>
        </TouchableRipple>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
    },
});
