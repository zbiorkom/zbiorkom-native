import { BottomSheetVirtualizedList } from "@gorhom/bottom-sheet";
import { useCallback } from "react";
import { EStopDeparture, EStopTime, ETrip, StopDeparture } from "~/tools/typings";
import StopSheetDeparture from "./StopSheetDeparture";
import { useBottomSheetPadding } from "@/BottomSheet";

export default ({ departures }: { departures?: StopDeparture[] }) => {
    const padding = useBottomSheetPadding();

    const renderItem = useCallback(
        ({ item }: { item: StopDeparture }) => <StopSheetDeparture departure={item} />,
        [],
    );

    return (
        <>
            <BottomSheetVirtualizedList
                data={departures || []}
                keyExtractor={(item: StopDeparture) =>
                    `${item[EStopDeparture.trip][ETrip.id]}-${item[EStopDeparture.stopTime][EStopTime.scheduledTime]}`
                }
                getItemCount={() => departures?.length || 0}
                getItem={(departures: StopDeparture[], index: number) => departures[index]}
                renderItem={renderItem}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                contentContainerStyle={padding}
            />
        </>
    );
};
