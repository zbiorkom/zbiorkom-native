import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Vehicle } from "~/tools/compactTypings";
import { Icon, Text } from "react-native-paper";
import { halfTransparentText } from "~/tools/constants";
import RouteIcon from "@/ui/RouteIcon";

type Props = {
    vehicle: Vehicle;
    showBrigade?: boolean;
    showFleet?: boolean;
    style?: StyleProp<ViewStyle>;
};

export default ({ vehicle, showBrigade, showFleet, style }: Props) => {
    const fleetId = vehicle.id.includes("/") ? vehicle.id.split("/")[1] : vehicle.id;

    return (
        <View
            collapsable={false}
            style={[styles.vehicleContainer, { backgroundColor: vehicle.route?.color }, style]}
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
    );
};

const styles = StyleSheet.create({
    vehicleContainer: {
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 10,
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
