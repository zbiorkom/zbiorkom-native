import { CircleLayer, ShapeSource } from "@maplibre/maplibre-react-native";
import { DotVehicles } from "@/tools/protobufTypings";
import { locationPrecision } from "@/tools";
import { useMemo } from "react";

export default ({ vehicles: { colors, vehicles } }: { vehicles: DotVehicles }) => {
    const geojsonData: GeoJSON.FeatureCollection = useMemo(() => {
        const features: GeoJSON.Feature[] = [];

        for (let i = 0; i < vehicles.length; i += 3) {
            const lon = vehicles[i] / locationPrecision;
            const lat = vehicles[i + 1] / locationPrecision;
            const color = colors[vehicles[i + 2]];

            features.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [lon, lat],
                },
                properties: {
                    color,
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
