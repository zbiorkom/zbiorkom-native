import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import BottomSheet, { useBottomSheetPadding } from "@/BottomSheet";
import { useFetchQuery } from "~/hooks/useQuery";
import { useCity } from "~/hooks/useBackend";
import { Trip, ETrip, ERoute } from "~/tools/typings";
import { useTheme } from "~/hooks/useTheme";
import LoadingState from "@/ui/LoadingState";
import RouteChip from "@/ui/RouteChip";
import { BottomSheetView } from "@gorhom/bottom-sheet";

type Props = {
    tripIdx?: number;
    onClose: () => void;
};

// FIXME: AI SLOP

export default ({ tripIdx, onClose }: Props) => {
    const [city] = useCity();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const padding = useBottomSheetPadding();

    const { data: trip, loadingState } = useFetchQuery<Trip>(city.id, `trips/${tripIdx}/summary`, {
        enabled: tripIdx !== undefined,
        resetDataOnKeyChange: true,
    });

    const handleShowFullTrip = () => {
        if (!trip) return;
        router.push({
            pathname: "/(tabs)/map/trip/[id]",
            params: { id: trip[ETrip.id], city: trip[ETrip.city], type: "trip" },
        });
        onClose();
    };

    return (
        <BottomSheet
            open={tripIdx !== undefined}
            onClose={onClose}
            backdrop
            headerLeftComponent={
                trip ? (
                    <View style={styles.header}>
                        <RouteChip route={trip[ETrip.route]} />
                        <Text variant="titleMedium" style={{ marginLeft: 8, fontWeight: "bold" }}>
                            {trip[ETrip.headsign]}
                        </Text>
                    </View>
                ) : undefined
            }
        >
            <BottomSheetView>
                <LoadingState loadingState={loadingState} />

                {trip && (
                    <View style={styles.content}>
                        <View style={styles.details}>
                            {trip[ETrip.firstStop] && (
                                <View style={styles.detailRow}>
                                    <Text
                                        variant="bodyMedium"
                                        style={{ color: theme.colors.onSurfaceVariant }}
                                    >
                                        Początek:
                                    </Text>
                                    <Text variant="bodyLarge" style={{ fontWeight: "500" }}>
                                        {trip[ETrip.firstStop][0]}
                                    </Text>
                                </View>
                            )}

                            {trip[ETrip.lastStop] && (
                                <View style={styles.detailRow}>
                                    <Text
                                        variant="bodyMedium"
                                        style={{ color: theme.colors.onSurfaceVariant }}
                                    >
                                        Koniec:
                                    </Text>
                                    <Text variant="bodyLarge" style={{ fontWeight: "500" }}>
                                        {trip[ETrip.lastStop][0]}
                                    </Text>
                                </View>
                            )}

                            {trip[ETrip.distance] !== undefined && (
                                <View style={styles.detailRow}>
                                    <Text
                                        variant="bodyMedium"
                                        style={{ color: theme.colors.onSurfaceVariant }}
                                    >
                                        Dystans:
                                    </Text>
                                    <Text variant="bodyLarge" style={{ fontWeight: "500" }}>
                                        {(trip[ETrip.distance] / 1000).toFixed(1)} km
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Button
                            mode="contained"
                            onPress={handleShowFullTrip}
                            style={styles.button}
                            contentStyle={styles.buttonContent}
                        >
                            Pokaż cały kurs
                        </Button>
                    </View>
                )}
            </BottomSheetView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    content: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    details: {
        gap: 12,
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    button: {
        marginTop: "auto",
    },
    buttonContent: {
        paddingVertical: 6,
    },
});
