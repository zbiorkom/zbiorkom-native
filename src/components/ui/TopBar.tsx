import { StyleSheet, View, LayoutChangeEvent, ViewStyle, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, IconButton } from "react-native-paper";
import { ReactNode, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { useRouter } from "expo-router";
import Animated, {
    interpolate,
    Extrapolation,
    useAnimatedStyle,
    interpolateColor,
    SharedValue,
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedRef,
    scrollTo,
} from "react-native-reanimated";

type TopBarOptions = {
    title: string;
    showBackButton?: boolean;
    rightComponent?: React.ReactNode;
    addBottomPadding?: boolean;
    stickyComponent?: React.ReactNode;
    hideLargeTitle?: boolean;
};

const topBarHeight = 50;

export const useTopBar = ({
    title,
    showBackButton,
    rightComponent,
    addBottomPadding,
    stickyComponent,
    hideLargeTitle,
}: TopBarOptions) => {
    const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(0);
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const { height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const headerHeight = useSharedValue(0);
    const direction = useSharedValue(0);
    const scrollY = useSharedValue(0);

    const Container = ({ children, style }: { children: ReactNode; style?: ViewStyle }) => {
        const scrollHandler = useAnimatedScrollHandler({
            onScroll: (event) => {
                const currentY = event.contentOffset.y;
                const diff = currentY - scrollY.value;

                if (diff > 0) {
                    direction.value = 1;
                } else if (diff < 0) {
                    direction.value = -1;
                }

                scrollY.value = currentY;
            },
            onEndDrag: (event) => {
                if (hideLargeTitle) return;

                const height = headerHeight.value;
                const y = event.contentOffset.y;

                if (height > 0 && y > 0 && y < height) {
                    if (Math.abs(event.velocity?.y ?? 0) < 1) {
                        scrollTo(scrollRef, 0, direction.value === 1 ? height : 0, true);
                    }
                }
            },
            onMomentumEnd: (event) => {
                if (hideLargeTitle) return;

                const height = headerHeight.value;
                const y = event.contentOffset.y;

                if (height > 0 && y > 0 && y < height) {
                    scrollTo(scrollRef, 0, direction.value === 1 ? height : 0, true);
                }
            },
        });

        return (
            <View style={{ flex: 1 }}>
                <TopBar
                    title={title}
                    showBackButton={showBackButton}
                    rightComponent={rightComponent}
                    scrollY={scrollY}
                    headerHeight={headerHeight}
                    hideLargeTitle={hideLargeTitle}
                />

                <Animated.ScrollView
                    ref={scrollRef}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    stickyHeaderIndices={stickyComponent ? [1] : undefined}
                    contentContainerStyle={[
                        {
                            paddingTop: topBarHeight + insets.top,
                            minHeight: windowHeight + measuredHeaderHeight,
                            paddingBottom: insets.bottom + (addBottomPadding ? 64 : 0),
                        },
                        style,
                    ]}
                >
                    {!hideLargeTitle && (
                        <View style={{ zIndex: 20 }}>
                            <LargeHeader
                                title={title}
                                onLayout={(e) => {
                                    const height = e.nativeEvent.layout.height;
                                    headerHeight.value = height;
                                    setMeasuredHeaderHeight(height);
                                }}
                            />
                        </View>
                    )}

                    {hideLargeTitle && <View style={{ height: 16 }} />}

                    {stickyComponent && (
                        <View
                            style={{
                                paddingTop: topBarHeight + insets.top,
                                marginTop: -(topBarHeight + insets.top),
                                backgroundColor: theme.colors.background,
                                zIndex: 10,
                            }}
                        >
                            {stickyComponent}
                        </View>
                    )}

                    {children}
                </Animated.ScrollView>
            </View>
        );
    };

    return { Container };
};

type LargeHeaderProps = {
    title: string;
    onLayout?: (event: LayoutChangeEvent) => void;
};

const LargeHeader = ({ title, onLayout }: LargeHeaderProps) => {
    const { theme } = useTheme();

    return (
        <View style={styles.largeHeaderContainer} onLayout={onLayout}>
            <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
                {title}
            </Text>
        </View>
    );
};

type TopBarProps = {
    title: string;
    showBackButton?: boolean;
    rightComponent?: React.ReactNode;
    scrollY: SharedValue<number>;
    headerHeight?: SharedValue<number>;
    hideLargeTitle?: boolean;
};

const TopBar = ({
    title,
    showBackButton,
    rightComponent,
    scrollY,
    headerHeight,
    hideLargeTitle,
}: TopBarProps) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const router = useRouter();

    const defaultHeaderHeight = useSharedValue(60);
    const heightToUse = headerHeight || defaultHeaderHeight;

    const containerStyle = useAnimatedStyle(() => {
        if (hideLargeTitle) {
            const backgroundColor = interpolateColor(
                scrollY.value,
                [0, 30],
                [theme.colors.background, theme.colors.surface]
            );

            return { backgroundColor };
        }

        const targetHeight = heightToUse.value;

        const backgroundColor = interpolateColor(
            scrollY.value,
            [targetHeight / 2, targetHeight],
            [theme.colors.background, theme.colors.surface]
        );

        return { backgroundColor };
    });

    const titleStyle = useAnimatedStyle(() => {
        if (hideLargeTitle) {
            return { opacity: 1, transform: [{ translateY: 0 }] };
        }

        const targetHeight = heightToUse.value;

        const opacity = interpolate(
            scrollY.value,
            [targetHeight - 20, targetHeight],
            [0, 1],
            Extrapolation.CLAMP
        );

        const translateY = interpolate(
            scrollY.value,
            [targetHeight - 20, targetHeight],
            [10, 0],
            Extrapolation.CLAMP
        );

        return { opacity, transform: [{ translateY }] };
    });

    return (
        <View style={[styles.container, { pointerEvents: "box-none" }]}>
            <Animated.View
                style={[{ paddingTop: insets.top, height: topBarHeight + insets.top }, containerStyle]}
            >
                <View style={[styles.content, { height: topBarHeight }]}>
                    <View style={styles.leftContainer}>
                        {showBackButton && (
                            <IconButton
                                icon="arrow-left"
                                size={20}
                                onPress={() => router.back()}
                                iconColor={theme.colors.onSurface}
                            />
                        )}

                        <Animated.View style={[styles.titleContainer, titleStyle]}>
                            <Text
                                variant="titleMedium"
                                numberOfLines={1}
                                style={{ color: theme.colors.onSurface }}
                            >
                                {title}
                            </Text>
                        </Animated.View>
                    </View>

                    <View style={styles.rightContainer}>{rightComponent}</View>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    content: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8,
    },
    leftContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    rightContainer: {
        alignItems: "flex-end",
    },
    titleContainer: {
        marginLeft: 4,
        flex: 1,
    },
    largeHeaderContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
    },
});

export default TopBar;
