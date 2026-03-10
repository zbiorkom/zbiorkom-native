import BottomSheet from "@/BottomSheet";
import { useShallow } from "zustand/shallow";
import { Portal } from "~/hooks/Portal";
import useMapSheets from "~/hooks/useMapSheets";
import { useEventQuery } from "~/hooks/useQuery";
import { EItinerary, EItineraryStop, EPosition, ERoute, EStop, ETrip, Itinerary, Position, Trip, TripStopTime } from "~/tools/typings";
import AnimatedMarker from "../Markers/AnimatedMarker";
import PositionMarker from "../Markers/PositionMarker";
import useSettings from "~/hooks/useSettings";
import TripItinerary from "../TripItinerary";
import TripSheetHeader from "./TripSheetHeader";
import LoadingState from "@/ui/LoadingState";
import TripSheetContent from "./TripSheetContent";
import { useEffect } from "react";
import { useMapNavigate, useMapFitBounds } from "~/hooks/useMapView";

export default ({ open }: { open: boolean }) => {
    const { showBrigade, showFleet } = useSettings();
    const [position, trip, goBack] = useMapSheets(
        useShallow((state) => [state.position, state.trip, state.goBack]),
    );
    const navigateTo = useMapNavigate();
    const fitBounds = useMapFitBounds();

    const { data, initialData, loadingState } = useEventQuery<
        { position?: Position; stops: TripStopTime[]; sequence: number },
        { trip: Trip; itinerary: Itinerary }
    >(
        position?.[EPosition.city] || trip?.[ETrip.city],
        position ? `positions/${position?.[EPosition.id]}/stream` : `trips/${trip?.[ETrip.id]}/stream`,
        {
            enabled: open && (!!position || !!trip),
            resetDataOnKeyChange: true,
        },
    );

    useEffect(() => {
        if (!open || !data) return;

        // if (data.position) {
        //     navigateTo(data.position[EPosition.location], 16);
        //     return;
        // }

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
    }, [open, data?.position, data?.sequence]);

    if (!position && !trip) return null;

    return (
        <>
            <BottomSheet
                open={open}
                dynamicSizing={false}
                headerLeftComponent={<TripSheetHeader trip={initialData?.trip} />}
                headerActions={[
                    {
                        icon: "dots-vertical",
                        onPress: () => {},
                    },
                ]}
                onClose={goBack}
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

            {open && (
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
            )}
        </>
    );
};
