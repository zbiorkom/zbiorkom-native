import BottomSheet from "@/BottomSheet";
import { MarkerView } from "@maplibre/maplibre-react-native";
import { useShallow } from "zustand/shallow";
import { Portal } from "~/hooks/Portal";
import useMapSheets from "~/hooks/useMapSheets";
import StopMarker from "../Markers/StopMarker";
import useSettings from "~/hooks/useSettings";
import StopSheetHeader from "./StopSheetHeader";
import { useEffect, useMemo } from "react";
import { useMapNavigate } from "~/hooks/useMapView";
import { EPosition, EStop, EStopDeparture, Position, Stop, StopDeparture } from "~/tools/typings";
import { useEventQuery } from "~/hooks/useQuery";
import StopSheetContent from "./StopSheetContent";
import AnimatedMarker from "../Markers/AnimatedMarker";
import PositionMarker from "../Markers/PositionMarker";
import LoadingState from "@/ui/LoadingState";

export default ({ open }: { open: boolean }) => {
    const [stop, goBack] = useMapSheets(useShallow((state) => [state.stop, state.goBack]));
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

    const uniquePositions = useMemo(() => {
        const positions: Position[] = [];
        const seenIds = new Set<string>();

        for (const departure of data || []) {
            const position = departure[EStopDeparture.position];

            if (position && !seenIds.has(position[EPosition.id])) {
                seenIds.add(position[EPosition.id]);
                positions.push(position);
            }
        }

        return positions;
    }, [data]);

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
                <LoadingState loadingState={loadingState} />

                <StopSheetContent departures={data} />
            </BottomSheet>

            {open && (
                <Portal host="map">
                    <MarkerView coordinate={stop[EStop.location]} key={stop[EStop.id]}>
                        <StopMarker stop={stop} useStopCode={useStopCode} />
                    </MarkerView>

                    {uniquePositions.map((position) => (
                        <AnimatedMarker
                            coordinate={position[EPosition.location]}
                            key={position[EPosition.id]}
                        >
                            <PositionMarker position={position} />
                        </AnimatedMarker>
                    ))}
                </Portal>
            )}
        </>
    );
};
