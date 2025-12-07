import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { MarkerView } from "@maplibre/maplibre-react-native";
import { useSharedValue, useAnimatedReaction, withTiming, Easing } from "react-native-reanimated";
import { Vehicle } from "@/tools/protobufTypings";
import { scheduleOnRN } from "react-native-worklets";
import { Icon, Text } from "react-native-paper";
import { halfTransparentText } from "@/tools";
import RouteIcon from "../ui/RouteIcon";

type Props = {
    vehicle: Vehicle;
    showBrigade?: boolean;
    showFleet?: boolean;
};

export default ({ vehicle, showBrigade, showFleet }: Props) => {
    const fleetId = vehicle.id.includes("/") ? vehicle.id.split("/")[1] : vehicle.id;

    const targetLon = vehicle.location[0] / 1e6;
    const targetLat = vehicle.location[1] / 1e6;

    const [currentCoord, setCurrentCoord] = useState([targetLon, targetLat]);

    const lonAnim = useSharedValue(targetLon);
    const latAnim = useSharedValue(targetLat);

    useEffect(() => {
        const distance =
            Math.pow((targetLon - lonAnim.value) * 111320, 2) +
            Math.pow((targetLat - latAnim.value) * 110540, 2);

        const duration = Math.min(Math.max((Math.sqrt(distance) / 70) * 350, 70), 350);

        lonAnim.value = withTiming(targetLon, { duration, easing: Easing.linear });
        latAnim.value = withTiming(targetLat, { duration, easing: Easing.linear });
    }, [targetLon, targetLat]);

    useAnimatedReaction(
        () => [lonAnim.value, latAnim.value],
        (curr) => scheduleOnRN(setCurrentCoord, curr)
    );

    return (
        <MarkerView coordinate={currentCoord}>
            <View
                collapsable={false}
                style={[styles.vehicleContainer, { backgroundColor: vehicle.route?.color }]}
            >
                <>
                    {vehicle.bearing !== undefined && (
                        <View style={{ transform: [{ rotate: `${vehicle.bearing}deg` }] }}>
                            <Icon source="arrow-up" size={16} color={halfTransparentText} />
                        </View>
                    )}

                    <RouteIcon
                        type={vehicle.route!.type}
                        agency={vehicle.route!.agency}
                        color={halfTransparentText}
                        size={16}
                    />

                    <Text style={styles.routeText}>{vehicle.route?.name}</Text>

                    <Text style={styles.detailsText}>
                        {showBrigade && vehicle.brigade ? `/${vehicle.brigade}` : ""}
                        {showFleet && !fleetId.startsWith("_") ? `/${fleetId}` : ""}
                    </Text>
                </>
            </View>
        </MarkerView>
    );
};

const styles = StyleSheet.create({
    vehicleContainer: {
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 8,
        pointerEvents: "none",
        zIndex: 100000,
        elevation: 100000,
    },
    routeText: {
        fontWeight: "bold",
        color: halfTransparentText,
        fontSize: 14,
        marginLeft: 1,
    },
    detailsText: {
        fontSize: 10,
        fontWeight: "600",
        color: halfTransparentText,
    },
});
