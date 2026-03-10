import { useRef, useEffect } from "react";
import { ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import RouteChip from "@/ui/RouteChip";
import { Route, ERoute } from "~/tools/typings";

interface StopRoutesListProps {
    routes: Route[];
    currentRoute: string;
    colorScheme: "light" | "dark" | null | undefined;
}

// FIXME: AI SLOP

export default ({ routes, currentRoute, colorScheme }: StopRoutesListProps) => {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const routePositions = useRef<Record<string, number>>({});

    useEffect(() => {
        if (!currentRoute || routePositions.current[currentRoute] === undefined) return;

        scrollViewRef.current?.scrollTo({
            x: Math.max(0, routePositions.current[currentRoute] - 16),
            animated: true,
        });
    }, [currentRoute]);

    if (routes.length === 0) return null;

    return (
        <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.routesList}
        >
            {routes.map((r) => {
                const isSelected = r[ERoute.id] === currentRoute;
                return (
                    <TouchableOpacity
                        key={r[ERoute.id]}
                        onLayout={(e) => {
                            routePositions.current[r[ERoute.id]] = e.nativeEvent.layout.x;
                            if (isSelected) {
                                scrollViewRef.current?.scrollTo({
                                    x: Math.max(0, e.nativeEvent.layout.x - 16),
                                    animated: true,
                                });
                            }
                        }}
                        onPress={() => {
                            router.setParams({ route: r[ERoute.id] });
                        }}
                        style={[
                            styles.routeChipWrapper,
                            !isSelected && {
                                opacity: 0.5,
                            },
                        ]}
                    >
                        <RouteChip route={r} darkMode={colorScheme === "dark"} />
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    routesList: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        gap: 8,
    },
    routeChipWrapper: {
        justifyContent: "center",
        alignItems: "center",
    },
});
