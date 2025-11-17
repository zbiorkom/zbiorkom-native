import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../hooks/useTheme";

interface TabLayout {
    x: number;
    width: number;
}

export default ({ state, descriptors, navigation, insets }: BottomTabBarProps) => {
    const { theme } = useTheme();
    const bottomInset = insets.bottom;
    const [layouts, setLayouts] = useState<Record<string, TabLayout>>({});
    const [pressedRouteKey, setPressedRouteKey] = useState<string | null>(null);

    const animatedLeft = useRef(new Animated.Value(0)).current;
    const animatedWidth = useRef(new Animated.Value(0)).current;
    const isFirstRender = useRef(true);
    const pressLeftExtra = useRef(new Animated.Value(0)).current;
    const pressWidthExtra = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const activeRoute = state.routes[state.index];
        const layout = layouts[activeRoute?.key ?? ""];

        if (!layout) {
            return;
        }

        if (isFirstRender.current) {
            animatedLeft.setValue(layout.x);
            animatedWidth.setValue(layout.width);
            isFirstRender.current = false;
            return;
        }

        Animated.parallel([
            Animated.spring(animatedLeft, {
                toValue: layout.x,
                useNativeDriver: false,
                damping: 14,
                stiffness: 160,
                mass: 0.6,
            }),
            Animated.spring(animatedWidth, {
                toValue: layout.width,
                useNativeDriver: false,
                damping: 14,
                stiffness: 160,
                mass: 0.6,
            }),
        ]).start();
    }, [animatedLeft, animatedWidth, layouts, state.index, state.routes]);

    useEffect(() => {
        const activeRoute = state.routes[state.index];
        const activeLayout = layouts[activeRoute?.key ?? ""];
        const pressedLayout = pressedRouteKey ? layouts[pressedRouteKey] : undefined;

        if (!activeLayout) {
            Animated.parallel([
                Animated.spring(pressLeftExtra, {
                    toValue: 0,
                    useNativeDriver: false,
                    damping: 18,
                    stiffness: 220,
                    mass: 0.5,
                }),
                Animated.spring(pressWidthExtra, {
                    toValue: 0,
                    useNativeDriver: false,
                    damping: 18,
                    stiffness: 220,
                    mass: 0.5,
                }),
            ]).start();
            return;
        }

        let extraLeft = 0;
        let extraWidth = 0;

        if (pressedLayout) {
            if (pressedRouteKey === activeRoute?.key) {
                extraWidth = 8;
            } else {
                const direction = Math.sign(pressedLayout.x - activeLayout.x);
                const distance = Math.abs(pressedLayout.x - activeLayout.x);

                extraLeft = direction * Math.min(distance * 0.18, 8);
                extraWidth = Math.min(distance * 0.36, 8);
            }
        }

        Animated.parallel([
            Animated.spring(pressLeftExtra, {
                toValue: extraLeft,
                useNativeDriver: false,
                damping: 18,
                stiffness: 220,
                mass: 0.5,
            }),
            Animated.spring(pressWidthExtra, {
                toValue: extraWidth,
                useNativeDriver: false,
                damping: 18,
                stiffness: 220,
                mass: 0.5,
            }),
        ]).start();
    }, [layouts, pressLeftExtra, pressWidthExtra, pressedRouteKey, state.index, state.routes]);

    const handleLayout = (routeKey: string) => (event: LayoutChangeEvent) => {
        const { x, width } = event.nativeEvent.layout;

        setLayouts((prev) => {
            const current = prev[routeKey];
            if (current && current.x === x && current.width === width) {
                return prev;
            }

            return {
                ...prev,
                [routeKey]: { x, width },
            };
        });
    };

    const tabItems = useMemo(() => state.routes, [state.routes]);

    return (
        <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: bottomInset + 4 }]}>
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.colors.surface,
                    },
                ]}
            >
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.bubble,
                        {
                            backgroundColor: theme.colors.primary,
                            transform: [
                                {
                                    translateX: Animated.add(animatedLeft, pressLeftExtra),
                                },
                            ],
                            width: Animated.add(animatedWidth, pressWidthExtra),
                        },
                    ]}
                />

                {tabItems.map((route, index) => {
                    const isFocused = state.index === index;
                    const { options } = descriptors[route.key];

                    const color = isFocused ? theme.colors.onPrimary : theme.colors.onSurface;

                    const icon = options.tabBarIcon?.({ focused: isFocused, color, size: 24 });

                    const onPress = () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    return (
                        <Pressable
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            style={styles.tabItem}
                            onPress={onPress}
                            onPressIn={() => setPressedRouteKey(route.key)}
                            onPressOut={() => setPressedRouteKey(null)}
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
