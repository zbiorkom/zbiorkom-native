import BottomSheet from "@/BottomSheet";
import { BottomSheetVirtualizedList } from "@gorhom/bottom-sheet";
import { MarkerView } from "@maplibre/maplibre-react-native";
import { useShallow } from "zustand/shallow";
import { Portal } from "~/hooks/Portal";
import useMapSheets from "~/hooks/useMapSheets";
import StopMarker from "../Markers/StopMarker";
import useSettings from "~/hooks/useSettings";
import StopSheetHeader from "./StopSheetHeader";
import { useCallback, useEffect } from "react";
import { useMapNavigate } from "~/hooks/useMapView";
import { EStop, ETrip, EStopDeparture, Stop, StopDeparture, EStopTime } from "~/tools/typings";
import { useEventQuery } from "~/hooks/useQuery";
import StopSheetDeparture from "./StopSheetDeparture";
import { useTheme } from "~/hooks/useTheme";
import LoadState from "@/ui/LoadState";

export default ({ open }: { open: boolean }) => {
    const [stop, goBack] = useMapSheets(useShallow((state) => [state.stop, state.goBack]));
    const { colorScheme, theme } = useTheme();
    const { useStopCode } = useSettings();
    const navigateTo = useMapNavigate();

    useEffect(() => {
        if (!open || !stop) return;

        navigateTo(stop[EStop.location], 16);
    }, [open, stop]);

    const { data, loadingState } = useEventQuery<StopDeparture[], Stop>(
        stop?.[EStop.city],
        `stops/${stop?.[EStop.id]}/stream`,
        {
            enabled: open && !!stop,
            resetDataOnKeyChange: true,
        },
    );

    const renderItem = useCallback(
        ({ item }: { item: StopDeparture }) => (
            <StopSheetDeparture departure={item} theme={theme} darkMode={colorScheme === "dark"} />
        ),
        [theme, colorScheme],
    );

    if (!stop) return null;

    return (
        <>
            <BottomSheet
                open={open}
                dynamicSizing={false}
                headerLeftComponent={<StopSheetHeader stop={stop} />}
                headerActions={[
                    {
                        icon: "dots-vertical",
                        onPress: () => {},
                    },
                ]}
                onClose={goBack}
            >
                {!!loadingState?.error || !!loadingState?.loading ? (
                    <LoadState loadingState={loadingState} />
                ) : (
                    <BottomSheetVirtualizedList
                        data={data || []}
                        keyExtractor={(item: StopDeparture) =>
                            `${item[EStopDeparture.trip][ETrip.id]}-${item[EStopDeparture.stopTime][EStopTime.scheduledTime]}`
                        }
                        getItemCount={(departures: StopDeparture[]) => departures.length}
                        getItem={(departures: StopDeparture[], index: number) => departures[index]}
                        renderItem={renderItem}
                        initialNumToRender={8}
                        maxToRenderPerBatch={8}
                        updateCellsBatchingPeriod={16}
                        windowSize={5}
                        removeClippedSubviews
                    />
                )}
            </BottomSheet>

            {open && (
                <Portal host="map">
                    <MarkerView coordinate={stop[EStop.location]} key={stop[EStop.id]}>
                        <StopMarker stop={stop} useStopCode={useStopCode} />
                    </MarkerView>
                </Portal>
            )}
        </>
    );
};
