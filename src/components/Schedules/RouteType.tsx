import RouteIcon, { defaultColors } from "@/ui/RouteIcon";
import { DarkScheme } from "material-color-lite";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { VehicleType } from "~/tools/typings";

type Props = {
    type: VehicleType;
    isSelected: boolean;
    onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default ({ type, isSelected, onPress }: Props) => {
    const scheme = new DarkScheme(defaultColors[type]);

    const animation = useSharedValue(isSelected ? 1 : 0.4);

    useEffect(() => {
        animation.value = withTiming(isSelected ? 1 : 0.4, { duration: 50 });
    }, [isSelected]);

    const animatedStyle = useAnimatedStyle(() => ({ opacity: animation.value }));

    return (
        <AnimatedPressable
            onPress={onPress}
            style={[styles.container, animatedStyle, { backgroundColor: scheme.primaryContainer }]}
        >
            <RouteIcon type={type} size={32} color={scheme.onPrimaryContainer} />
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        minWidth: 60,
        height: 56,
    },
});
