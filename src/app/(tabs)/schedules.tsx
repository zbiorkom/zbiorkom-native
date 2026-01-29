import RouteBox from "@/Schedules/RouteBox";
import SearchFilter from "@/Schedules/SearchFilter";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, Keyboard } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCity } from "~/hooks/useBackend";
import { useFetchQuery } from "~/hooks/useQuery";
import { ERoute, Route } from "~/tools/typings";

export default () => {
    const { top, bottom, left, right } = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const [city] = useCity();
    const { data } = useFetchQuery<Route[]>(city.id, "routes", isFocused);

    const [filteredData, setFilteredData] = useState<Route[]>([]);
    const [isAtTop, setIsAtTop] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        if (data) setFilteredData(data);
    }, [data]);

    if (!data) {
        return (
            <View style={styles.container}>
                <ActivityIndicator style={{ flex: 1 }} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: top, paddingLeft: left, paddingRight: right }]}>
            <FlatList
                style={{ flex: 1 }}
                onScroll={({ nativeEvent }) => {
                    const y = nativeEvent.contentOffset.y;
                    const top = y <= 10;
                    if (top !== isAtTop) setIsAtTop(top);

                    if (y > 10) {
                        Keyboard.dismiss();
                    }
                }}
                onScrollBeginDrag={() => Keyboard.dismiss()}
                scrollEventThrottle={16}
                data={filteredData}
                renderItem={({ item }) => <RouteBox route={item} />}
                keyExtractor={(item) => item[ERoute.id]}
                keyboardShouldPersistTaps={"handled"}
                getItemLayout={(_, index) => ({ length: 96, offset: 96 * index, index })}
                contentContainerStyle={{ paddingBottom: bottom + 60 + 84 }}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={false}
            />

            <SearchFilter
                autoFocus={isAtTop && isFocused && !isFilterOpen}
                routes={data}
                onResults={setFilteredData}
                onFilterStateChange={setIsFilterOpen}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
