import BottomSheet from "@/BottomSheet";
import { BottomSheetVirtualizedList } from "@gorhom/bottom-sheet";
import { MarkerView } from "@maplibre/maplibre-react-native";
import { useShallow } from "zustand/shallow";
import { Portal } from "~/hooks/Portal";
import useMapSheets from "~/hooks/useMapSheets";
import StopMarker from "../Markers/StopMarker";
import useSettings from "~/hooks/useSettings";
import StopSheetHeader from "./StopSheetHeader";
import { useEffect } from "react";
import { useMapNavigate } from "~/hooks/useMapView";
import { EStop, Stop, StopDeparture } from "~/tools/typings";
import { useEventQuery } from "~/hooks/useQuery";
import StopSheetDeparture from "./StopSheetDeparture";

export default ({ open }: { open: boolean }) => {
    const [stop, goBack] = useMapSheets(useShallow((state) => [state.stop, state.goBack]));
    const { useStopCode } = useSettings();
    const navigateTo = useMapNavigate();

    useEffect(() => {
        if (!open || !stop) return;

        navigateTo(stop[EStop.location], 16);
    }, [open, stop]);

    const { data, initialData, isLoading, error } = useEventQuery<StopDeparture[], Stop>(
        stop?.[EStop.city],
        `stops/${stop?.[EStop.id]}/stream`,
        {
            enabled: !!stop,
            hasInitialData: true,
            resetDataOnKeyChange: true,
        },
    );

    if (!stop) return null;

    const stopInfo = initialData || stop;

    return (
        <>
            <BottomSheet
                open={open}
                headerLeftComponent={<StopSheetHeader stop={stopInfo} />}
                headerActions={[
                    {
                        icon: "star-outline",
                        onPress: () => {
                            console.log("Pressed star outline");
                        },
                    },
                    {
                        icon: "dots-vertical",
                        onPress: () => {
                            console.log("Pressed dots vertical");
                        },
                    },
                ]}
                onClose={goBack}
            >
                <BottomSheetVirtualizedList
                    data={data || []}
                    keyExtractor={(i: number) => `dep${i}`}
                    getItemCount={(data: StopDeparture[]) => data.length}
                    getItem={(data: StopDeparture[], index: number) => data[index]}
                    renderItem={({ item }: { item: StopDeparture }) => (
                        <StopSheetDeparture departure={item} />
                    )}
                />
            </BottomSheet>

            {open && (
                <Portal host="map">
                    <MarkerView coordinate={stopInfo[EStop.location]} key={stopInfo[EStop.id]}>
                        <StopMarker stop={stopInfo} useStopCode={useStopCode} />
                    </MarkerView>
                </Portal>
            )}
        </>
    );
};
