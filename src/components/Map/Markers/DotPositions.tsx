import { CircleLayer, ShapeSource } from "@maplibre/maplibre-react-native";
import { useMemo } from "react";
import { DotPosition, EDotPosition } from "~/tools/typings";

export default ({ dotPositions }: { dotPositions: DotPosition[] }) => {
    const geojsonData: GeoJSON.FeatureCollection = useMemo(() => {
        const features: GeoJSON.Feature[] = [];

        for (const dot of dotPositions) {
            features.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: dot[EDotPosition.location],
                },
                properties: {
                    color: dot[EDotPosition.color],
                },
            });
        }

        return {
            type: "FeatureCollection",
            features,
        };
    }, [dotPositions]);

    return (
        <ShapeSource id="positions-source" shape={geojsonData}>
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
