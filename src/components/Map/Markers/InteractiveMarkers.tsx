import { CircleLayer, ShapeSource, SymbolLayer } from "@maplibre/maplibre-react-native";
import { EPosition, ERoute, EStop, Position, Stop } from "~/tools/typings";
import { useMemo } from "react";

type Props = {
    positions: Position[];
    stops: Stop[];
    showBrigade?: boolean;
    showFleet?: boolean;
};

export default ({ positions, stops, showBrigade, showFleet }: Props) => {
    const geojsonData: GeoJSON.FeatureCollection = useMemo(() => {
        const features: GeoJSON.Feature[] = [];

        for (const position of positions) {
            const fleetId = position[EPosition.id].split(":")[1];

            const size =
                1 +
                position[EPosition.route][ERoute.name].length * 0.25 +
                (showBrigade && position[EPosition.brigade] ? position[EPosition.brigade].length * 0.16 : 0) +
                (showFleet && !fleetId.startsWith("_") ? fleetId.length * 0.16 : 0);

            features.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: position[EPosition.location],
                },
                properties: {
                    type: "position",
                    position,
                    size,
                },
            });
        }

        for (const stop of stops) {
            features.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: stop[EStop.location],
                },
                properties: {
                    type: "stop",
                    stop,
                },
            });
        }

        return {
            type: "FeatureCollection",
            features,
        };
    }, [positions, stops]);

    return (
        <ShapeSource id="interactive-markers" shape={geojsonData}>
            <CircleLayer
                id="stops"
                style={{
                    circleRadius: 20,
                    circleOpacity: 0,
                }}
                filter={["==", ["get", "type"], "stop"]}
            />

            <SymbolLayer
                id="positions"
                style={{
                    iconImage: "us-state_6",
                    iconSize: ["get", "size"],
                    iconOpacity: 0,
                    iconAllowOverlap: true,
                    iconPadding: [10],
                }}
                filter={["==", ["get", "type"], "position"]}
            />
        </ShapeSource>
    );
};
