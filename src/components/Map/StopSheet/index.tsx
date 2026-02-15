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
import { EStop, ETrip, EStopDeparture, Stop, StopDeparture } from "~/tools/typings";
import { useEventQuery } from "~/hooks/useQuery";
import StopSheetDeparture from "./StopSheetDeparture";
import { useTheme } from "~/hooks/useTheme";

export default ({ open }: { open: boolean }) => {
    const [stop, goBack] = useMapSheets(useShallow((state) => [state.stop, state.goBack]));
    const { colorScheme, theme } = useTheme();
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
            enabled: open && !!stop,
            resetDataOnKeyChange: true,
        },
    );

    if (!stop) return null;

    return (
        <>
            <BottomSheet
                open={open}
                headerLeftComponent={<StopSheetHeader stop={stop} />}
                headerActions={[
                    {
                        icon: "star-outline",
                        onPress: () => {},
                    },
                    {
                        icon: "dots-vertical",
                        onPress: () => {},
                    },
                ]}
                onClose={goBack}
            >
                <BottomSheetVirtualizedList
                    data={data || []}
                    keyExtractor={(item: StopDeparture) =>
                        `${item[EStopDeparture.trip][ETrip.id]}-${item[EStopDeparture.scheduledDeparture]}`
                    }
                    getItemCount={(data: StopDeparture[]) => data.length}
                    getItem={(data: StopDeparture[], index: number) => data[index]}
                    renderItem={({ item }: { item: StopDeparture }) => (
                        <StopSheetDeparture
                            departure={item}
                            theme={theme}
                            darkMode={colorScheme === "dark"}
                        />
                    )}
                />
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
