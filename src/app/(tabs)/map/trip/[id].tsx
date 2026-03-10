import BottomSheet from "@/BottomSheet";
import { Portal } from "~/hooks/Portal";
import useSettings from "~/hooks/useSettings";
import TripItinerary from "@/Map/TripItinerary";
import AnimatedMarker from "@/Map/Markers/AnimatedMarker";
import PositionMarker from "@/Map/Markers/PositionMarker";
import LoadingState from "@/ui/LoadingState";
import { useEffect } from "react";
import { useMapFitBounds } from "~/hooks/useMapView";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEventQuery } from "~/hooks/useQuery";
import {
    EItinerary,
    EItineraryStop,
    EPosition,
    ERoute,
    EStop,
    ETrip,
    Itinerary,
    Position,
    Trip,
    TripStopTime,
} from "~/tools/typings";
import TripSheetHeader from "@/Map/Trip/TripSheetHeader";
import TripSheetContent from "@/Map/Trip/TripSheetContent";

export default () => {
    const { id, city, type } = useLocalSearchParams<{ id: string; city: string; type: "position" | "trip" }>();
    const router = useRouter();
    const { showBrigade, showFleet } = useSettings();
    const fitBounds = useMapFitBounds();

    const endpoint = type === "position" ? `positions/${id}/stream` : `trips/${id}/stream`;

    const { data, initialData, loadingState } = useEventQuery<
        { position?: Position; stops: TripStopTime[]; sequence: number },
        { trip: Trip; itinerary: Itinerary }
    >(city, endpoint, {
        enabled: !!id && !!city,
        resetDataOnKeyChange: true,
    });

    useEffect(() => {
        if (!data) return;

        const itineraryStops = initialData?.itinerary?.[EItinerary.stops];
        if (!itineraryStops || itineraryStops.length < 2) return;

        const seq = data.sequence;
        const lastIndex = itineraryStops.length - 1;

        let idx1: number;
        let idx2: number;

        if (seq - 1 >= lastIndex) {
            idx1 = lastIndex - 1;
            idx2 = lastIndex;
        } else {
            idx1 = seq - 1;
            idx2 = seq;
        }

        const loc1 = itineraryStops[idx1][EItineraryStop.stop][EStop.location];
        const loc2 = itineraryStops[idx2][EItineraryStop.stop][EStop.location];

        const ne: GeoJSON.Position = [Math.max(loc1[0], loc2[0]), Math.max(loc1[1], loc2[1])];
        const sw: GeoJSON.Position = [Math.min(loc1[0], loc2[0]), Math.min(loc1[1], loc2[1])];

        fitBounds(ne, sw);
    }, [data?.position, data?.sequence]);

    return (
        <>
            <BottomSheet
                open={true}
                dynamicSizing={false}
                headerLeftComponent={<TripSheetHeader trip={initialData?.trip} />}
                headerActions={[
                    {
                        icon: "dots-vertical",
                        onPress: () => {},
                    },
                ]}
                onClose={(isSwipeDown) => {
                    if (isSwipeDown) {
                        router.navigate("/(tabs)/map");
                    } else {
                        router.back();
                    }
                }}
            >
                <LoadingState loadingState={loadingState} />
                <TripSheetContent
                    trip={initialData?.trip}
                    itinerary={initialData?.itinerary}
                    stopTimes={data?.stops}
                    position={data?.position}
                    sequence={data?.sequence}
                />
            </BottomSheet>

            <Portal host="map">
                {data?.position && (
                    <AnimatedMarker
                        coordinate={data.position[EPosition.location]}
                        key={data.position[EPosition.id]}
                    >
                        <PositionMarker
                            position={data.position}
                            showBrigade={showBrigade}
                            showFleet={showFleet}
                        />
                    </AnimatedMarker>
                )}

                {initialData?.itinerary && (
                    <TripItinerary
                        itinerary={initialData.itinerary}
                        color={initialData.trip[ETrip.route][ERoute.color]}
                    />
                )}
            </Portal>
        </>
    );
};
