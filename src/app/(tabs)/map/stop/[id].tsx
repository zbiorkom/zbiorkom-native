import BottomSheet from "@/BottomSheet";
import { MarkerView } from "@maplibre/maplibre-react-native";
import { Portal } from "~/hooks/Portal";
import useSettings from "~/hooks/useSettings";
import StopMarker from "@/Map/Markers/StopMarker";
import AnimatedMarker from "@/Map/Markers/AnimatedMarker";
import PositionMarker from "@/Map/Markers/PositionMarker";
import LoadingState from "@/ui/LoadingState";
import { useEffect, useMemo } from "react";
import { useMapNavigate } from "~/hooks/useMapView";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEventQuery } from "~/hooks/useQuery";
import { EPosition, EStop, Position, Stop, StopDeparture, EStopDeparture } from "~/tools/typings";
import StopSheetHeader from "@/Map/Stop/StopSheetHeader";
import StopSheetContent from "@/Map/Stop/StopSheetContent";

export default () => {
    const { id, city } = useLocalSearchParams<{ id: string; city: string }>();
    const router = useRouter();
    const { useStopCode } = useSettings();
    const navigateTo = useMapNavigate();

    const { data, initialData: stop, loadingState } = useEventQuery<StopDeparture[], Stop>(
        city,
        `stops/${id}/stream`,
        { enabled: !!id && !!city, resetDataOnKeyChange: true },
    );

    useEffect(() => {
        if (!stop) return;
        navigateTo(stop[EStop.location], 16);
    }, [stop]);

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

    return (
        <>
            <BottomSheet
                open={true}
                dynamicSizing={false}
                headerLeftComponent={stop ? <StopSheetHeader stop={stop} /> : undefined}
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
                <StopSheetContent departures={data} />
            </BottomSheet>

            {stop && (
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
