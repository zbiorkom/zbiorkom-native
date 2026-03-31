import BottomSheet from "@/BottomSheet";
import { Portal } from "~/hooks/Portal";
import useSettings from "~/hooks/useSettings";
import TripItinerary from "@/Map/TripItinerary";
import AnimatedMarker from "@/Map/Markers/AnimatedMarker";
import PositionMarker from "@/Map/Markers/PositionMarker";
import LoadingState from "@/ui/LoadingState";
import { useCallback, useEffect, useRef, useState } from "react";
import useMapView, { useMapFitBounds } from "~/hooks/useMapView";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEventQuery } from "~/hooks/useQuery";
import { Dimensions } from "react-native";
import {
    EItinerary,
    EItineraryStop,
    EPosition,
    ERoute,
    EStop,
    ETrip,
    Itinerary,
    Position,
    Trip,
    TripStopTime,
} from "~/tools/typings";
import TripSheetHeader from "@/Map/Trip/TripSheetHeader";
import TripSheetContent from "@/Map/Trip/TripSheetContent";

export default () => {
    const { id, city, type } = useLocalSearchParams<{ id: string; city: string; type: "position" | "trip" }>();
    const router = useRouter();
    const { showBrigade, showFleet } = useSettings();
    const fitBounds = useMapFitBounds();

    const [isFollowing, setIsFollowing] = useState(true);
    const isFirstLoad = useRef(true);

    const endpoint = type === "position" ? `positions/${id}/stream` : `trips/${id}/stream`;

    const { data, initialData, loadingState } = useEventQuery<
        { position?: Position; stops: TripStopTime[]; sequence: number },
        { trip: Trip; itinerary: Itinerary }
    >(city, endpoint, {
        enabled: !!id && !!city,
        resetDataOnKeyChange: true,
    });

    const hasPosition = !!data?.position;

    // Detect user map interaction → disable follow
    useEffect(() => {
        const unsub = useMapView.subscribe((state) => {
            if (state.userMovedMap) {
                setIsFollowing(false);
                useMapView.getState().setUserMovedMap(false);
            }
        });
        return unsub;
    }, []);

    // Reset on unmount
    useEffect(() => {
        return () => {
            useMapView.getState().setUserMovedMap(false);
        };
    }, []);

    const doFitBounds = useCallback(
        (animated: boolean) => {
            if (!data?.position) return;

            const itineraryStops = initialData?.itinerary?.[EItinerary.stops];
            if (!itineraryStops || itineraryStops.length < 2) return;

            const vehicleLoc = data.position[EPosition.location];
            const seq = data.sequence;
            const lastIndex = itineraryStops.length - 1;

            const nextIdx = seq >= lastIndex ? lastIndex : seq;
            const nextStopLoc = itineraryStops[nextIdx][EItineraryStop.stop][EStop.location];

            const ne: GeoJSON.Position = [
                Math.max(vehicleLoc[0], nextStopLoc[0]),
                Math.max(vehicleLoc[1], nextStopLoc[1]),
            ];
            const sw: GeoJSON.Position = [
                Math.min(vehicleLoc[0], nextStopLoc[0]),
                Math.min(vehicleLoc[1], nextStopLoc[1]),
            ];

            fitBounds(ne, sw, {
                padding: {
                    paddingLeft: 80,
                    paddingRight: 80,
                    paddingTop: 80,
                    paddingBottom: Dimensions.get("window").height * 0.4,
                },
                zoomLevel: 16,
                animationDuration: animated ? 500 : 0,
            });
        },
        [data?.position, data?.sequence, initialData?.itinerary, fitBounds],
    );

    // On first data load or when following + position/sequence changes
    useEffect(() => {
        if (!data?.position) return;

        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            doFitBounds(false);
            return;
        }

        if (isFollowing) {
            doFitBounds(true);
        }
    }, [data?.position, data?.sequence]);

    // When follow is re-activated
    useEffect(() => {
        if (isFollowing && !isFirstLoad.current && data?.position) {
            doFitBounds(true);
        }
    }, [isFollowing]);

    const handleUserScroll = useCallback(() => {
        setIsFollowing(false);
    }, []);

    const handleFollowPress = useCallback(() => {
        setIsFollowing((prev) => !prev);
    }, []);

    return (
        <>
            <BottomSheet
                open={true}
                dynamicSizing={false}
                headerLeftComponent={<TripSheetHeader trip={initialData?.trip} />}
                headerActions={[
                    hasPosition && {
                        icon: isFollowing ? "crosshairs-gps" : "crosshairs",
                        onPress: handleFollowPress,
                    },
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
                <TripSheetContent
                    trip={initialData?.trip}
                    itinerary={initialData?.itinerary}
                    stopTimes={data?.stops}
                    position={data?.position}
                    sequence={data?.sequence}
                    isFollowing={isFollowing}
                    onUserScroll={handleUserScroll}
                />
            </BottomSheet>

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
        </>
    );
};
