import { useEffect, useState } from "react";
import { ActivityIndicator, Icon, Text } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useTheme } from "~/hooks/useTheme";
import { LoadingState } from "~/hooks/useQuery";

const loadingDelayMs = 75;

export default ({ loadingState: { loading, error } = {} }: { loadingState?: LoadingState }) => {
    const { theme } = useTheme();
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        if (!loading || !!error) {
            setShowLoading(false);
            return;
        }

        const timeout = setTimeout(() => {
            setShowLoading(true);
        }, loadingDelayMs);

        return () => clearTimeout(timeout);
    }, [loading, error, loadingDelayMs]);

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorWrapper}>
                    <Icon source="alert-circle-outline" size={20} color={theme.colors.error} />
                    <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                        {error}
                    </Text>
                </View>
            </View>
        );
    }

    if (showLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator color={theme.colors.primary} />
            </View>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: 16,
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    errorWrapper: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
});
