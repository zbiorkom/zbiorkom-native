import { CircleLayer, ShapeSource } from "@maplibre/maplibre-react-native";
import { DotVehicles } from "~/tools/protobufTypings";
import { useMemo } from "react";
import { normalizeLocation } from "~/tools/constants";

export default ({ vehicles: { colors, vehicles } }: { vehicles: DotVehicles }) => {
    const geojsonData: GeoJSON.FeatureCollection = useMemo(() => {
        const features: GeoJSON.Feature[] = [];

        for (let i = 0; i < vehicles.length; i += 3) {
            features.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: normalizeLocation([vehicles[i], vehicles[i + 1]]),
                },
                properties: {
                    color: colors[vehicles[i + 2]],
                },
            });
        }

        return {
            type: "FeatureCollection",
            features,
        };
    }, [vehicles]);

    return (
        <ShapeSource id="vehicles-source" shape={geojsonData}>
            <CircleLayer
                id="dots"
                style={{
                    circleRadius: 4,
                    circleColor: ["get", "color"],
                }}
            />
        </ShapeSource>
    );
};
