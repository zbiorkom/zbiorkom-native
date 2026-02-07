import BottomSheet from "@/BottomSheet";
import { BottomSheetScrollView, BottomSheetView, BottomSheetVirtualizedList } from "@gorhom/bottom-sheet";
import { MarkerView } from "@maplibre/maplibre-react-native";
import { Text } from "react-native-paper";
import { useShallow } from "zustand/shallow";
import { Portal } from "~/hooks/Portal";
import useMapSheets from "~/hooks/useMapSheets";
import StopMarker from "../Markers/StopMarker";
import useSettings from "~/hooks/useSettings";
import StopSheetHeader from "./StopSheetHeader";
import { useEffect } from "react";
import { useMapNavigate } from "~/hooks/useMapView";
import { EStop, Stop, StopDeparture } from "~/tools/typings";
import { useEventQuery, useFetchQuery } from "~/hooks/useQuery";
import StopSheetDeparture from "./StopSheetDeparture";
import { VirtualizedList } from "react-native";

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
                <BottomSheetScrollView>
                    {isLoading && <Text>Ładowanie...</Text>}
                    {error && <Text>Błąd: {error}</Text>}
                    {data?.length === 0 && <Text>Brak odjazdów</Text>}

                    {data?.map((departure, index) => (
                        <StopSheetDeparture departure={departure} key={`dep${index}`} />
                    ))}
                </BottomSheetScrollView>
                {/* <BottomSheetVirtualizedList 
                    data={data || []}
                    keyExtractor={(i) => `dep${i}`}
                    getItemCount={(data) => data.length}
                    getItem={(data, index) => data[index]}
                    renderItem={({ item }) => <StopSheetDeparture departure={item} />}
                /> */}
                
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
