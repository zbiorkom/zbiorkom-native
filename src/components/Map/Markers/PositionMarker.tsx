import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Icon, Text } from "react-native-paper";
import { halfTransparentText } from "~/tools/constants";
import RouteIcon from "@/ui/RouteIcon";
import { EPosition, ERoute, Position } from "~/tools/typings";

type Props = {
    position: Position;
    showBrigade?: boolean;
    showFleet?: boolean;
    style?: StyleProp<ViewStyle>;
};

export default ({ position, showBrigade, showFleet, style }: Props) => {
    const fleetId = position[EPosition.id].split(":")[1];

    return (
        <View
            collapsable={false}
            style={[
                styles.vehicleContainer,
                { backgroundColor: position[EPosition.route][ERoute.color] },
                style,
            ]}
        >
            <>
                {position[EPosition.bearing] !== undefined && (
                    <View style={{ transform: [{ rotate: `${position[EPosition.bearing]}deg` }] }}>
                        <Icon source="arrow-up" size={16} color={halfTransparentText} />
                    </View>
                )}

                <RouteIcon
                    type={position[EPosition.route][ERoute.type]}
                    agency={position[EPosition.route][ERoute.agency]}
                    color={halfTransparentText}
                    size={16}
                />

                <Text style={styles.routeText}>{position[EPosition.route][ERoute.name]}</Text>

                <Text style={styles.detailsText}>
                    {showBrigade && position[EPosition.brigade] ? `/${position[EPosition.brigade]}` : ""}
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
