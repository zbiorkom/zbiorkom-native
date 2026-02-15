import RouteIcon from "@/ui/RouteIcon";
import { useRouter } from "expo-router";
import { DarkScheme } from "material-color-lite";
import { memo, useMemo } from "react";
import { StyleSheet, View, Keyboard } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import { useTheme } from "~/hooks/useTheme";
import { ERoute, Route } from "~/tools/typings";

export default memo(({ route }: { route: Route }) => {
    const router = useRouter();
    const { colorScheme } = useTheme();

    const theme = useMemo(() => new DarkScheme(route[ERoute.color]), [route]);
    const backgroundColor = useMemo(
        () => (colorScheme === "dark" ? theme.primaryContainer + "33" : theme.onPrimaryContainer + "bb"),
        [colorScheme, theme],
    );
    const textColor = useMemo(
        () => (colorScheme === "dark" ? theme.onPrimaryContainer : theme.primaryContainer),
        [colorScheme, theme],
    );

    const [longNameFirst, longNameSecond] = useMemo(() => route[ERoute.longName].split("—"), [route]);

    return (
        <TouchableRipple
            style={[styles.container, { backgroundColor }]}
            rippleColor={backgroundColor}
            borderless
            onPress={() => {
                Keyboard.dismiss();
                router.push({
                    pathname: "/schedule/[route]",
                    params: { route: route[ERoute.id] },
                });
            }}
        >
            <>
                <View style={[styles.routeNameContainer, { backgroundColor: theme.primaryContainer }]}>
                    <RouteIcon
                        city={route[ERoute.city]}
                        type={route[ERoute.type]}
                        agency={route[ERoute.agency]}
                        color={theme.onPrimaryContainer}
                        size={32}
                    />

                    <Text
                        style={[styles.routeNameText, { color: theme.onPrimaryContainer }]}
                        variant="titleLarge"
                    >
                        {route[ERoute.name]}
                    </Text>
                </View>

                <View style={styles.routeLongNameContainer}>
                    {longNameFirst && (
                        <Text
                            style={[styles.routeLongNameText, { color: textColor, textAlign: "left" }]}
                            numberOfLines={longNameSecond ? 1 : 2}
                        >
                            {longNameFirst.trim()}
                        </Text>
                    )}

                    {longNameSecond && (
                        <Text
                            style={[styles.routeLongNameText, { color: textColor, textAlign: "right" }]}
                            numberOfLines={1}
                        >
                            {longNameSecond.trim()}
                        </Text>
                    )}
                </View>
            </>
        </TouchableRipple>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        margin: 8,
        borderRadius: 24,
        height: 80,
    },
    routeNameContainer: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 24,
        padding: 16,
        height: "100%",
        minWidth: 80,
    },
    routeNameText: {
        textAlign: "center",
        textAlignVertical: "center",
        fontWeight: "bold",
    },
    routeLongNameContainer: {
        justifyContent: "center",
        padding: 16,
        flex: 1,
    },
    routeLongNameText: {
        fontWeight: "500",
        fontSize: 16,
    },
});
