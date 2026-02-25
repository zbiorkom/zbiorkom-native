import React, { useState, useEffect, useRef } from "react";
import { View, Pressable, ScrollView, StyleSheet, LayoutChangeEvent } from "react-native";
import { Text } from "react-native-paper";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";
import { useTheme } from "~/hooks/useTheme";

export interface TabsProps {
    items: string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

export default ({ items, selectedIndex, onSelect }: TabsProps) => {
    const [layouts, setLayouts] = useState<{ x: number; width: number }[]>([]);
    const indicatorPosition = useSharedValue(0);
    const indicatorWidth = useSharedValue(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (layouts[selectedIndex]) {
            indicatorPosition.value = withTiming(layouts[selectedIndex].x, { duration: 250 });
            indicatorWidth.value = withTiming(layouts[selectedIndex].width, { duration: 250 });

            scrollViewRef.current?.scrollTo({
                x: layouts[selectedIndex].x - 50,
                animated: true,
            });
        }
    }, [selectedIndex, layouts]);

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorPosition.value }],
        width: indicatorWidth.value,
        backgroundColor: theme.colors.primary,
    }));

    return (
        <View style={{ backgroundColor: theme.colors.background }}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {items.map((item, index) => (
                    <TabItem
                        key={index}
                        label={item}
                        isSelected={index === selectedIndex}
                        onPress={() => onSelect(index)}
                        onLayout={(e) => {
                            const { x, width } = e.nativeEvent.layout;

                            setLayouts((prev) => {
                                const newLayouts = [...prev];
                                newLayouts[index] = { x, width };
                                return newLayouts;
                            });
                        }}
                    />
                ))}

                {layouts.length > 0 && <Animated.View style={[styles.indicator, indicatorStyle]} />}
            </ScrollView>
        </View>
    );
};

interface TabItemProps {
    label: string;
    isSelected: boolean;
    onPress: () => void;
    onLayout: (e: LayoutChangeEvent) => void;
}

const TabItem = ({ label, isSelected, onPress, onLayout }: TabItemProps) => {
    const progress = useSharedValue(isSelected ? 1 : 0);
    const { theme } = useTheme();

    useEffect(() => {
        progress.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
    }, [isSelected]);

    const normalStyle = useAnimatedStyle(() => ({
        opacity: 1 - progress.value,
    }));

    const boldStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
    }));

    return (
        <Pressable onPress={onPress} onLayout={onLayout} style={styles.tab}>
            <View style={styles.labelContainer}>
                <Text
                    variant="labelLarge"
                    numberOfLines={1}
                    style={{ fontWeight: "bold", opacity: 0, minWidth: 60, textAlign: "center" }}
                >
                    {label}
                </Text>

                <Animated.View style={[StyleSheet.absoluteFill, styles.centerContent, normalStyle]}>
                    <Text
                        variant="labelLarge"
                        numberOfLines={1}
                        style={{ color: theme.colors.onSurfaceVariant, minWidth: 60, textAlign: "center" }}
                    >
                        {label}
                    </Text>
                </Animated.View>

                <Animated.View style={[StyleSheet.absoluteFill, styles.centerContent, boldStyle]}>
                    <Text
                        variant="labelLarge"
                        numberOfLines={1}
                        style={{
                            color: theme.colors.primary,
                            fontWeight: "bold",
                            minWidth: 60,
                            textAlign: "center",
                        }}
                    >
                        {label}
                    </Text>
                </Animated.View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        position: "relative",
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    labelContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    centerContent: {
        alignItems: "center",
        justifyContent: "center",
    },
    indicator: {
        position: "absolute",
        bottom: -2,
        height: 2,
        borderRadius: 1,
    },
});
