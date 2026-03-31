import RouteIcon from "@/ui/RouteIcon";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { darkFilter, halfTransparentText } from "~/tools/constants";
import { ERoute, Route } from "~/tools/typings";

type Props = {
    percentTraveled: number;
    route: Route;
    darkMode?: boolean;
};

export default ({ percentTraveled, route, darkMode }: Props) => {
    const vehiclePosition = useSharedValue(0);

    useEffect(() => {
        vehiclePosition.value = withSpring(percentTraveled, {
            damping: 20,
            stiffness: 90,
            mass: 1,
        });
    }, [percentTraveled]);

    const vehicleAnimStyle = useAnimatedStyle(() => ({
        top: `${vehiclePosition.value}%`,
    }));

    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            style={[
                styles.vehicleIndicator,
                { backgroundColor: route[ERoute.color] },
                vehicleAnimStyle,
                darkMode && darkFilter,
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
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        justifyContent: "center",
        marginTop: 24,
        zIndex: 10,
    },
});
