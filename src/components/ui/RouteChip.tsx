import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { ERoute, Route } from "~/tools/typings";
import RouteIcon from "./RouteIcon";
import { darkFilter, halfTransparentText } from "~/tools/constants";

export default ({ route, darkMode }: { route: Route; darkMode?: boolean }) => {
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: route[ERoute.color], filter: darkMode ? darkFilter : undefined },
            ]}
        >
            <RouteIcon
                city={route[ERoute.city]}
                type={route[ERoute.type]}
                agency={route[ERoute.agency]}
                color={halfTransparentText}
                size={18}
            />

            <Text style={styles.routeText}>{route[ERoute.name]}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    routeText: {
        fontWeight: "bold",
        color: halfTransparentText,
        fontSize: 16,
    },
});
