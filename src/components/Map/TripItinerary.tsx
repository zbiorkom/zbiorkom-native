import { CircleLayer, LineLayer, ShapeSource, SymbolLayer } from "@maplibre/maplibre-react-native";
import { useMemo } from "react";
import { polylineToGeoJson } from "~/tools/index";
import { EItinerary, EItineraryStop, EStop, Itinerary } from "~/tools/typings";

export default ({ itinerary, color }: { itinerary: Itinerary; color?: string }) => {
    const stops = useMemo<GeoJSON.GeoJSON>(
        () => ({
            type: "FeatureCollection",
            features: itinerary[EItinerary.stops].map((stop) => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: stop[EItineraryStop.stop][EStop.location],
                },
                properties: {
                    id: stop[EItineraryStop.stop][EStop.id],
                    color,
                    title: `${stop[EItineraryStop.stop][EStop.name]} ${stop[EItineraryStop.stop][EStop.code] || ""}`.trim(),
                },
            })),
        }),
        [itinerary, color],
    );

    const shape = useMemo(() => polylineToGeoJson(itinerary[EItinerary.shape]), [itinerary]);

    return (
        <>
            <ShapeSource id="route" shape={shape}>
                <LineLayer
                    id="route"
                    style={{
                        lineJoin: "round",
                        lineCap: "round",
                        lineColor: color,
                        lineWidth: 4,
                    }}
                />
            </ShapeSource>

            <ShapeSource id="stops" shape={stops}>
                <CircleLayer
                    id="stops"
                    style={{
                        circleRadius: 4.5,
                        circleColor: "#fff",
                        circleStrokeWidth: 2.5,
                        circleStrokeColor: color,
                    }}
                />
                <SymbolLayer 
                    id="stop-labels"
                    style={{
                        textField: ["get", "title"],
                        textSize: 12,
                        textFont: ["Noto Sans Bold"],
                        textOffset: [0, 1.5],
                        textAnchor: "top",
                        textAllowOverlap: false,
                        textColor: color,
                        textHaloColor: "#fff",
                        textHaloWidth: 1,
                    }}
                    filter={["all", [">=", ["zoom"], 13.5]]}
                />
            </ShapeSource>
        </>
    );
};
