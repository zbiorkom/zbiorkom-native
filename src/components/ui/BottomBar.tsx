import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useCallback, useState } from "react";
import { useTheme } from "~/hooks/useTheme";
import * as Haptics from "expo-haptics";

const BUBBLE_SPRING_CONFIG = {
    damping: 14,
    stiffness: 160,
    mass: 0.6,
};

const PRESS_SPRING_CONFIG = {
    damping: 18,
    stiffness: 220,
    mass: 0.5,
};

const MAX_STRETCH_DISTANCE = 8;
const STRETCH_FACTOR = 0.18;

export default ({ state, descriptors, navigation, insets }: BottomTabBarProps) => {
    const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
    const bottomInset = insets.bottom;
    const { theme } = useTheme();

    const bubbleTranslateX = useSharedValue(0);
    const bubbleWidth = useSharedValue(0);
    const pressExtraTranslateX = useSharedValue(0);
    const pressExtraWidth = useSharedValue(0);

    const animatedBubbleStyle = useAnimatedStyle(() => {
        const activeRoute = state.routes[state.index];
        const activeLayout = layouts[activeRoute?.key];

        if (!activeLayout) return {};

        bubbleTranslateX.value = withSpring(activeLayout.x, BUBBLE_SPRING_CONFIG);
        bubbleWidth.value = withSpring(activeLayout.width, BUBBLE_SPRING_CONFIG);

        return {
            transform: [{ translateX: bubbleTranslateX.value + pressExtraTranslateX.value }],
            width: bubbleWidth.value + pressExtraWidth.value,
        };
    }, [layouts, state.index]);

    const handleLayout = useCallback(
        (routeKey: string) => (event: LayoutChangeEvent) => {
            const { x, width } = event.nativeEvent.layout;

            setLayouts((prev) => {
                const current = prev[routeKey];

                if (current && current.x === x && current.width === width) {
                    return prev;
                }

                return { ...prev, [routeKey]: { x, width } };
            });
        },
        []
    );

    const handlePressIn = (routeKey: string) => () => {
        const activeRouteKey = state.routes[state.index].key;
        const activeLayout = layouts[activeRouteKey];
        const pressedLayout = layouts[routeKey];

        if (!activeLayout || !pressedLayout) return;

        let extraLeft = 0;
        let extraWidth = 0;

        if (routeKey === activeRouteKey) {
            const isFirst = state.index === 0;
            const isLast = state.index === state.routes.length - 1;

            extraWidth = MAX_STRETCH_DISTANCE;

            if (isLast) {
                extraLeft = -MAX_STRETCH_DISTANCE;
            } else if (isFirst) {
                extraLeft = 0;
            } else {
                extraLeft = -(MAX_STRETCH_DISTANCE / 2);
            }
        } else {
            const direction = Math.sign(pressedLayout.x - activeLayout.x);
            const distance = Math.abs(pressedLayout.x - activeLayout.x);

            extraLeft = direction * Math.min(distance * STRETCH_FACTOR, MAX_STRETCH_DISTANCE);
            extraWidth = Math.min(distance * STRETCH_FACTOR * 2, MAX_STRETCH_DISTANCE);
        }

        pressExtraTranslateX.value = withSpring(extraLeft, PRESS_SPRING_CONFIG);
        pressExtraWidth.value = withSpring(extraWidth, PRESS_SPRING_CONFIG);
    };

    const handlePressOut = () => {
        pressExtraTranslateX.value = withSpring(0, PRESS_SPRING_CONFIG);
        pressExtraWidth.value = withSpring(0, PRESS_SPRING_CONFIG);
    };

    return (
        <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: bottomInset + 4 }]}>
            <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
                <Reanimated.View
                    pointerEvents="none"
                    style={[
                        styles.bubble,
                        { backgroundColor: theme.colors.secondaryContainer },
                        animatedBubbleStyle,
                    ]}
                />

                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const { options } = descriptors[route.key];
                    const icon = options.tabBarIcon?.({
                        focused: isFocused,
                        color: isFocused ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant,
                        size: 24,
                    });

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }

                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    };

                    return (
                        <Pressable
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            style={styles.tabItem}
                            onPress={onPress}
                            onPressIn={handlePressIn(route.key)}
                            onPressOut={handlePressOut}
                            onLayout={handleLayout(route.key)}
                        >
                            <View style={styles.content}>{icon}</View>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 16,
        paddingTop: 8,
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        width: "100%",
    },
    container: {
        flexDirection: "row",
        borderRadius: 100,
        padding: 8,
        position: "relative",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
    },
    bubble: {
        position: "absolute",
        top: 8,
        bottom: 8,
        borderRadius: 100,
    },
    tabItem: {
        flex: 1,
        borderRadius: 100,
        padding: 8,
    },
    content: {
        alignItems: "center",
        justifyContent: "center",
    },
});
