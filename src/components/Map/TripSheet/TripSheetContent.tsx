import { BottomSheetVirtualizedList } from "@gorhom/bottom-sheet";
import { useCallback } from "react";
import {
    EItinerary,
    ERoute,
    ETrip,
    Itinerary,
    ItineraryStop,
    Position,
    Trip,
    TripStopTime,
} from "~/tools/typings";
import { useBottomSheetPadding } from "@/BottomSheet";
import TripSheetStop from "./TripSheetStop";

type Props = {
    trip?: Trip;
    itinerary?: Itinerary;
    stopTimes?: TripStopTime[];
    position?: Position;
    sequence?: number;
};

export default ({ trip, itinerary, stopTimes, position, sequence }: Props) => {
    const padding = useBottomSheetPadding();
    const itineraryStops = itinerary?.[EItinerary.stops] || [];

    const renderItem = useCallback(
        ({ item, index }: { item: ItineraryStop; index: number }) => (
            <TripSheetStop
                index={index}
                stop={item}
                stopTime={stopTimes?.[index]}
                color={trip?.[ETrip.route][ERoute.color]}
                totalStops={itineraryStops.length}
            />
        ),
        [stopTimes, itineraryStops],
    );

    return (
        <>
            <BottomSheetVirtualizedList
                data={itineraryStops}
                keyExtractor={(_: any, index: number) => `stop-${index}`}
                getItemCount={() => itineraryStops.length}
                getItem={(itineraryStops: ItineraryStop[], index: number) => itineraryStops[index]}
                renderItem={renderItem}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                contentContainerStyle={padding}
            />
        </>
    );
};
