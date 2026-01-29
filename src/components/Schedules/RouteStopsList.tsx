import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Svg, { Circle, Line } from "react-native-svg";
import { useTheme } from "~/hooks/useTheme";
import {
    RouteGraphDirection,
    EDirectionNodeType,
    EDirectionEdgeType,
    ERouteGraphDirectionStop,
    EStop,
    ERouteConnection,
} from "~/tools/typings";
import { DarkScheme, LightScheme } from "material-color-lite";

const BRANCH_OFFSET = 24;
const LINE_WIDTH = 5;
const STOP_DOT_SIZE = 16;
const STOP_ROW_HEIGHT = 56;
const LEFT_PADDING = 16;
const DOT_CENTER = LEFT_PADDING + STOP_DOT_SIZE / 2;
const BRANCH_DOT_CENTER = LEFT_PADDING + BRANCH_OFFSET + STOP_DOT_SIZE / 2;

type RouteStopsListProps = {
    direction: RouteGraphDirection;
    routeColor: string;
};

const RouteStopsList = ({ direction, routeColor }: RouteStopsListProps) => {
    const { stops, connections } = direction;
    const { theme, colorScheme } = useTheme();

    const routeTheme = new (colorScheme === "dark" ? DarkScheme : LightScheme)(routeColor);

    const mainColor = routeTheme.getTone("primary", 40);
    const branchColor = routeTheme.getTone("tertiary", 40);

    if (!stops || stops.length === 0) {
        return <Text>Brak przystanków</Text>;
    }

    const getNodeX = (stopIndex: number) => {
        if (stopIndex < 0 || stopIndex >= stops.length) return DOT_CENTER;
        const nodeType = stops[stopIndex][1];
        return nodeType === EDirectionNodeType.Branch ? BRANCH_DOT_CENTER : DOT_CENTER;
    };

    return (
        <View style={styles.stopsList}>
            <Svg
                width={BRANCH_DOT_CENTER + STOP_DOT_SIZE}
                height={stops.length * STOP_ROW_HEIGHT}
                style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
            >
                {connections.map((conn, index) => {
                    const startIndex = conn[ERouteConnection.startIndex];
                    const endIndex = conn[ERouteConnection.endIndex];

                    const startX = getNodeX(startIndex);
                    const startY = startIndex * STOP_ROW_HEIGHT + STOP_ROW_HEIGHT / 2;

                    const endX = getNodeX(endIndex);
                    const endY = endIndex * STOP_ROW_HEIGHT + STOP_ROW_HEIGHT / 2;

                    const edgeType = conn[ERouteConnection.edgeType];
                    const isNormal = edgeType === EDirectionEdgeType.Normal;
                    const lineColor = isNormal ? mainColor : branchColor;

                    return (
                        <Line
                            key={`conn-${index}`}
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke={lineColor}
                            strokeWidth={LINE_WIDTH}
                        />
                    );
                })}
            </Svg>

            {stops.map((stopData, index) => {
                const stop = stopData[0];
                const nodeType = stopData[1];
                const nodeX = nodeType === EDirectionNodeType.Branch ? BRANCH_DOT_CENTER : DOT_CENTER;
                const isNormal = nodeType === EDirectionNodeType.Normal;
                const dotColor = isNormal ? mainColor : branchColor;

                return (
                    <View key={`${stop[EStop.id]}-${index}`} style={styles.stopRow}>
                        <View style={{ width: BRANCH_DOT_CENTER + STOP_DOT_SIZE, height: STOP_ROW_HEIGHT }}>
                            <Svg
                                width={STOP_DOT_SIZE}
                                height={STOP_DOT_SIZE}
                                style={{
                                    position: "absolute",
                                    left: nodeX - STOP_DOT_SIZE / 2,
                                    top: STOP_ROW_HEIGHT / 2 - STOP_DOT_SIZE / 2,
                                    zIndex: 1,
                                }}
                            >
                                <Circle
                                    cx={STOP_DOT_SIZE / 2}
                                    cy={STOP_DOT_SIZE / 2}
                                    r={STOP_DOT_SIZE / 2 - 1}
                                    fill={dotColor}
                                    stroke={theme.colors.background}
                                    strokeWidth={2}
                                />
                            </Svg>
                        </View>

                        <Text
                            style={[
                                styles.stopName,
                                {
                                    color: theme.colors.onBackground,
                                    marginLeft: nodeType === EDirectionNodeType.Branch ? BRANCH_OFFSET : 0,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {stop[EStop.name]} {stop[EStop.code] || ""}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

export default RouteStopsList;

const styles = StyleSheet.create({
    stopsList: {
        paddingHorizontal: 0,
    },
    stopRow: {
        flexDirection: "row",
        alignItems: "center",
        height: STOP_ROW_HEIGHT,
    },
    svgContainer: {
        overflow: "visible",
    },
    stopName: {
        fontSize: 15,
        flex: 1,
        marginLeft: 10,
    },
});
