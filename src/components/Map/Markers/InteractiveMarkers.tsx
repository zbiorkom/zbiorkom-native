import { CircleLayer, ShapeSource, SymbolLayer } from "@maplibre/maplibre-react-native";
import { Stop, Vehicle } from "~/tools/protobufTypings";
import { useMemo } from "react";
import { normalizeLocation } from "~/tools/constants";

type Props = {
    vehicles: Vehicle[];
    stops: Stop[];
    showBrigade?: boolean;
    showFleet?: boolean;
};

export default ({ vehicles, stops, showBrigade, showFleet }: Props) => {
    const geojsonData: GeoJSON.FeatureCollection = useMemo(() => {
        const features: GeoJSON.Feature[] = [];

        for (const vehicle of vehicles) {
            const fleetId = vehicle.id.split("/")[1];

            const size =
                1 +
                vehicle.route!.name.length * 0.25 +
                (showBrigade && vehicle.brigade ? vehicle.brigade.length * 0.16 : 0) +
                (showFleet && !fleetId.startsWith("_") ? fleetId.length * 0.16 : 0);

            features.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: normalizeLocation(vehicle.location),
                },
                properties: {
                    type: "vehicle",
                    vehicle,
                    size,
                },
            });
        }

        for (const stop of stops) {
            features.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: normalizeLocation(stop.location),
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
    }, [vehicles, stops]);

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
                id="vehicles"
                style={{
                    iconImage: "us-state_6",
                    iconSize: ["get", "size"],
                    iconOpacity: 0,
                    iconAllowOverlap: true,
                    iconPadding: [10],
                }}
                filter={["==", ["get", "type"], "vehicle"]}
            />
        </ShapeSource>
    );
};
