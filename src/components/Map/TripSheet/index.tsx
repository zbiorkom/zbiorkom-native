import BottomSheet from "@/BottomSheet";
import { useShallow } from "zustand/shallow";
import { Portal } from "~/hooks/Portal";
import useMapSheets from "~/hooks/useMapSheets";
import { useEventQuery } from "~/hooks/useQuery";
import { EPosition, ERoute, ETrip, Itinerary, Position, Trip, TripStopTime } from "~/tools/typings";
import AnimatedMarker from "../Markers/AnimatedMarker";
import PositionMarker from "../Markers/PositionMarker";
import useSettings from "~/hooks/useSettings";
import TripItinerary from "../TripItinerary";
import TripSheetHeader from "./TripSheetHeader";
import LoadingState from "@/ui/LoadingState";
import TripSheetContent from "./TripSheetContent";

export default ({ open }: { open: boolean }) => {
    const { showBrigade, showFleet } = useSettings();
    const [position, trip, goBack] = useMapSheets(
        useShallow((state) => [state.position, state.trip, state.goBack]),
    );

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

    if (!position && !trip) return null;

    return (
        <>
            <BottomSheet
                open={open}
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
