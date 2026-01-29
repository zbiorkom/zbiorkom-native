import { useLocalSearchParams } from "expo-router";
import { useState, useMemo } from "react";
import { View } from "react-native";
import { ActivityIndicator, Menu, Button } from "react-native-paper";
import { useTheme } from "~/hooks/useTheme";
import { useCity } from "~/hooks/useBackend";
import { useFetchQuery } from "~/hooks/useQuery";
import { ERoute, ERouteGraphDirectionStop, EStop, RouteDetails } from "~/tools/typings";
import RouteStopsList from "@/Schedules/RouteStopsList";
import { useTopBar } from "@/ui/TopBar";

export default () => {
    const { route } = useLocalSearchParams();
    const { theme } = useTheme();
    const [city] = useCity();
    const [selectedDirection, setSelectedDirection] = useState(0);
    const [menuVisible, setMenuVisible] = useState(false);

    const { data, isLoading, error } = useFetchQuery<RouteDetails>(city!.id, `routes/${route}`);

    const directionOptions = useMemo(() => {
        if (!data) return [];

        return data.graph.map((dir, index) => ({
            label: `→ ${dir.stops.at(-1)![ERouteGraphDirectionStop.stop][EStop.name]}`,
            value: index,
        }));
    }, [data]);

    const { Container } = useTopBar({
        title: `Linia ${data?.route[ERoute.name] || route}`,
        showBackButton: true,
        stickyComponent: (
            <View>
                {data && directionOptions.length > 0 && (
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                            <Button
                                mode="outlined"
                                onPress={() => setMenuVisible(true)}
                                icon="chevron-down"
                                contentStyle={{ flexDirection: "row-reverse" }}
                                style={{ borderColor: theme.colors.outline }}
                            >
                                {directionOptions[selectedDirection]?.label}
                            </Button>
                        }
                    >
                        {directionOptions.map((option) => (
                            <Menu.Item
                                key={option.value}
                                onPress={() => {
                                    setMenuVisible(false);
                                    setSelectedDirection(option.value);
                                }}
                                title={option.label}
                                titleStyle={
                                    option.value === selectedDirection
                                        ? { fontWeight: "bold", color: theme.colors.primary }
                                        : undefined
                                }
                            />
                        ))}
                    </Menu>
                )}
            </View>
        ),
    });

    return (
        <Container>
            {isLoading && <ActivityIndicator animating size="large" style={{ flex: 1 }} />}

            {data?.graph[selectedDirection] && (
                <RouteStopsList
                    direction={data.graph[selectedDirection]}
                    routeColor={data.route[ERoute.color]}
                />
            )}
        </Container>
    );
};
