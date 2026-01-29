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
    const scrollY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    const Container = ({ children, style }: { children: ReactNode; style?: ViewStyle }) => {
        const snap = (y: number, velocity: number = 0) => {
            "worklet";
            if (hideLargeTitle) return;

            const height = headerHeight.value;
            if (height > 0 && y > 0 && y < height) {
                if (Math.abs(velocity) < 100) {
                    scrollTo(scrollRef, 0, y > height / 2 ? height : 0, true);
                }
            }
        };

        const scrollHandler = useAnimatedScrollHandler({
            onScroll: (event) => {
                scrollY.value = event.contentOffset.y;
            },
            onBeginDrag: () => {
                isDragging.value = true;
            },
            onEndDrag: (event) => {
                isDragging.value = false;
                snap(event.contentOffset.y, event.velocity?.y);
            },
            onMomentumEnd: (event) => {
                if (isDragging.value) return;
                snap(event.contentOffset.y, 0);
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
                    showsVerticalScrollIndicator={false}
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
            <Text variant="displaySmall" style={{ color: theme.colors.onBackground }}>
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
            return { backgroundColor: theme.colors.background };
        }

        return { backgroundColor: theme.colors.background };
    });

    const titleStyle = useAnimatedStyle(() => {
        if (hideLargeTitle) {
            return { opacity: 1 };
        }

        const targetHeight = heightToUse.value;

        if (targetHeight === 0) {
            return { opacity: 0 };
        }

        const opacity = interpolate(
            scrollY.value,
            [targetHeight - 20, targetHeight],
            [0, 1],
            Extrapolation.CLAMP,
        );

        return { opacity };
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
                                style={{ color: theme.colors.onSurface, fontWeight: "600" }}
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
        paddingTop: 60,
    },
});

export default TopBar;
