import { BottomSheetVirtualizedList } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { VirtualizedList } from "react-native";
import {
    EItinerary,
    EPosition,
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

const ITEM_HEIGHT = 68;

type Props = {
    trip?: Trip;
    itinerary?: Itinerary;
    stopTimes?: TripStopTime[];
    position?: Position;
    sequence?: number;
    isFollowing?: boolean;
    onUserScroll?: () => void;
};

export default ({ trip, itinerary, stopTimes, position, sequence, isFollowing, onUserScroll }: Props) => {
    const padding = useBottomSheetPadding();
    const itineraryStops = itinerary?.[EItinerary.stops] || [];
    const listRef = useRef<VirtualizedList<ItineraryStop>>(null);
    const hasScrolledInitially = useRef(false);

    const initialScrollIndex = useMemo(() => {
        if (!sequence || itineraryStops.length === 0) return undefined;
        return Math.max(0, Math.min(sequence - 1, itineraryStops.length - 1));
    }, []);

    // useEffect(() => {
    //     if (!sequence || itineraryStops.length === 0 || hasScrolledInitially.current) return;

    //     const targetIndex = Math.max(0, Math.min(sequence - 1, itineraryStops.length - 1));
    //     hasScrolledInitially.current = true;

    //     // Timeout to ensure the list is mounted and laid out before attempting to scroll to index
    //     setTimeout(() => {
    //         listRef.current?.scrollToIndex({ index: targetIndex, animated: false, viewPosition: 0.3 });
    //     }, 100);
    // }, [sequence, itineraryStops.length]);

    const getItemLayout = useCallback(
        (_: any, index: number) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
        }),
        [],
    );

    // const onScrollToIndexFailed = useCallback((info: { index: number; averageItemLength: number }) => {
    //     listRef.current?.scrollToOffset({ offset: info.index * info.averageItemLength, animated: true });
    // }, []);

    const renderItem = useCallback(
        ({ item, index }: { item: ItineraryStop; index: number }) => (
            <TripSheetStop
                index={index}
                stop={item}
                stopTime={stopTimes?.[index]}
                route={trip?.[ETrip.route]!}
                totalStops={itineraryStops.length}
                sequence={sequence}
                percentTraveled={position?.[EPosition.percentTraveled]}
            />
        ),
        [stopTimes, itineraryStops, sequence, position],
    );

    if (!itineraryStops.length) {
        return null;
    }

    return (
        <>
            <BottomSheetVirtualizedList
                ref={listRef}
                data={itineraryStops}
                keyExtractor={(_: any, index: number) => `stop-${index}`}
                getItemCount={() => itineraryStops.length}
                getItem={(itineraryStops: ItineraryStop[], index: number) => itineraryStops[index]}
                renderItem={renderItem}
                initialNumToRender={itineraryStops.length}
                maxToRenderPerBatch={itineraryStops.length}
                initialScrollIndex={12}
                
                getItemLayout={getItemLayout}
                contentContainerStyle={padding}
                onScrollBeginDrag={onUserScroll}
            />
        </>
    );
};
