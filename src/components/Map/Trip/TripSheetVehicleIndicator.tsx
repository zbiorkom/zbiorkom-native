import RouteIcon from "@/ui/RouteIcon";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { darkFilter, halfTransparentText } from "~/tools/constants";
import { ERoute, Route } from "~/tools/typings";

type Props = {
    percentTraveled: number;
    route: Route;
    darkMode?: boolean;
};

export default ({ percentTraveled, route, darkMode }: Props) => {
    const vehiclePosition = useSharedValue(percentTraveled);

    useEffect(() => {
        vehiclePosition.value = withTiming(percentTraveled, { duration: 300 });
    }, [percentTraveled]);

    const vehicleAnimStyle = useAnimatedStyle(() => ({
        top: `${vehiclePosition.value}%`,
    }));

    return (
        <Animated.View
            style={[
                styles.vehicleIndicator,
                { backgroundColor: route[ERoute.color] },
                vehicleAnimStyle,
                !darkMode && darkFilter,
            ]}
        >
            <RouteIcon type={route[ERoute.type]} color={halfTransparentText} size={18} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    vehicleIndicator: {
        position: "absolute",
        width: 30,
        height: 22,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
        zIndex: 10,
    },
});
