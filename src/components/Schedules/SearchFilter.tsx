import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import RouteType from "@/Schedules/RouteType";
import { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { Pressable, StyleSheet, View, Keyboard, Platform } from "react-native";
import { Checkbox, Searchbar, Text, useTheme, IconButton } from "react-native-paper";
import useSystemBack from "~/hooks/useSystemBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ERoute, Route, VehicleType } from "~/tools/typings";
import { useAgencies } from "~/hooks/useBackend";

type Props = {
    routes?: Route[];
    onResults: (results: Route[]) => void;
    autoFocus?: boolean;
    onFilterStateChange?: (isOpen: boolean) => void;
};
export default function SearchFilter({ routes, onResults, autoFocus, onFilterStateChange }: Props) {
    const theme = useTheme();
    const agencies = useAgencies();
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const { bottom: bottomInset, left: leftInset, right: rightInset } = useSafeAreaInsets();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<VehicleType[]>([]);
    const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const searchRef = useRef<any>(null);

    useEffect(() => {
        onFilterStateChange?.(isSheetOpen);
    }, [isSheetOpen, onFilterStateChange]);

    useEffect(() => {
        if (autoFocus) {
            const t = setTimeout(() => searchRef.current?.focus && searchRef.current.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [autoFocus]);

    useSystemBack(() => {
        bottomSheetRef.current?.close();
        setIsSheetOpen(false);
        return true;
    }, isSheetOpen);

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />,
        [],
    );

    const { availableTypes, availableAgencies } = useMemo(() => {
        if (!routes) return { availableTypes: [], availableAgencies: [] };

        const types = new Set<VehicleType>();
        const routeAgencies = new Set<string>();

        routes.forEach((r) => {
            types.add(r[ERoute.type]);
            routeAgencies.add(r[ERoute.agency]);
        });

        const typeFilters: { label: string; value: VehicleType }[] = [];
        Array.from(types)
            .sort((a, b) => a - b)
            .forEach((t) => {
                typeFilters.push({
                    label: String(VehicleType[t]),
                    value: t,
                });
            });

        const agencyFilters: { label: string; value: string }[] = [];
        Array.from(routeAgencies)
            .sort()
            .forEach((a) => {
                const agencyName = agencies?.[a || "default"]?.name || a;
                agencyFilters.push({
                    label: agencyName,
                    value: a,
                });
            });

        return { availableTypes: typeFilters, availableAgencies: agencyFilters };
    }, [routes, agencies]);

    useEffect(() => {
        if (selectedTypes.length === 0 && availableTypes.length > 0) {
            setSelectedTypes(availableTypes.map((t) => t.value));
        }
    }, [availableTypes]);

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const onShow = (e: any) => {
            setKeyboardHeight(e?.endCoordinates?.height || 0);
        };

        const onHide = () => {
            setKeyboardHeight(0);
        };

        const showSub = Keyboard.addListener(showEvent, onShow);
        const hideSub = Keyboard.addListener(hideEvent, onHide);

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const toggleType = (type: VehicleType) => {
        setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
    };

    const toggleAgency = (agencyValue: string) => {
        setSelectedAgencies((prev) =>
            prev.includes(agencyValue) ? prev.filter((a) => a !== agencyValue) : [...prev, agencyValue],
        );
    };

    const filtered = useMemo(() => {
        if (!routes) return [];
        const searchLower = (searchQuery || "").trim().toLowerCase();
        const typesSet = new Set(selectedTypes);
        const agenciesSet = new Set(selectedAgencies);

        return routes.filter((route) => {
            const matchesSearch =
                !searchLower ||
                (route[ERoute.name] || "").toLowerCase().includes(searchLower) ||
                (route[ERoute.longName] || "").toLowerCase().includes(searchLower);

            const matchesType = typesSet.has(route[ERoute.type]);

            const matchesAgency = selectedAgencies.length === 0 || agenciesSet.has(route[ERoute.agency]);

            return matchesSearch && matchesType && matchesAgency;
        });
    }, [routes, searchQuery, selectedTypes, selectedAgencies]);

    useEffect(() => {
        onResults(filtered);
    }, [filtered, onResults]);

    return (
        <>
            <View
                style={{
                    position: "absolute",
                    bottom: isFocused && keyboardHeight > 0 ? keyboardHeight + 32 : bottomInset + 60,
                    left: 16 + leftInset,
                    right: 16 + rightInset,
                }}
            >
                <Searchbar
                    ref={searchRef}
                    placeholder="Szukaj..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    right={() => (
                        <IconButton
                            icon="filter-variant"
                            onPress={() => {
                                bottomSheetRef.current?.present();
                                setIsSheetOpen(true);
                                Keyboard.dismiss();
                            }}
                        />
                    )}
                    style={styles.searchbar}
                />
            </View>

            <BottomSheetModal
                ref={bottomSheetRef}
                index={0}
                enableDynamicSizing={true}
                enablePanDownToClose={true}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: theme.colors.surface }}
                handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
                onDismiss={() => setIsSheetOpen(false)}
            >
                <BottomSheetScrollView
                    contentContainerStyle={[styles.filterContainer, { paddingBottom: bottomInset + 16 }]}
                >
                    <View style={styles.typesContainer}>
                        {availableTypes.map((type) => (
                            <RouteType
                                key={`type-${type.value}`}
                                type={type.value}
                                isSelected={selectedTypes.includes(type.value)}
                                onPress={() => toggleType(type.value)}
                            />
                        ))}
                    </View>

                    <View>
                        {availableAgencies.map((agency) => (
                            <Pressable
                                key={`agency-${agency.value}`}
                                onPress={() => toggleAgency(agency.value)}
                                style={styles.agencyRow}
                            >
                                <Checkbox
                                    status={selectedAgencies.includes(agency.value) ? "checked" : "unchecked"}
                                />
                                <Text variant="bodyLarge">{agency.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                </BottomSheetScrollView>
            </BottomSheetModal>
        </>
    );
}

const styles = StyleSheet.create({
    searchbar: {
        elevation: 4,
    },
    filterContainer: {
        padding: 16,
    },
    typesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    agencyRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
    },
});
