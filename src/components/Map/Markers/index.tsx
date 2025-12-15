import { useWebsocketSubscription } from "~/hooks/useWebsocket";
import useMapView from "~/hooks/useMapView";
import { useShallow } from "zustand/shallow";
import VehicleMarker from "./VehicleMarker";
import DotVehicles from "./DotVehicles";
import { Portal } from "~/hooks/Portal";
import InteractiveMarkers from "./InteractiveMarkers";
import useSettings from "~/hooks/useSettings";
import StopMarker from "./StopMarker";
import { MarkerView } from "@maplibre/maplibre-react-native";
import { locationPrecision } from "~/tools/constants";
import AnimatedMarker from "./AnimatedMarker";

export default () => {
    const [bounds, zoom] = useMapView(useShallow((state) => [state.bounds!, state.zoom!]));
    const { showBrigade, showFleet, useStopCode } = useSettings();

    const { data } = useWebsocketSubscription("subscribeMapFeatures", {
        options: {
            city: "warsaw",
            bounds,
            zoom,
            filterRoutes: [],
            filterModels: [],
        },
        disabled: !bounds || !zoom,
        mergeHandler: (prevData, newData) => {
            if (newData.stopsChanged) return newData;

            return {
                ...newData,
                stops: prevData?.stops || [],
            };
        },
    });

    if (!data) return null;

    return (
        <Portal host="map">
            {data.stops.map((stop) => (
                <MarkerView
                    coordinate={[stop.location[0] / locationPrecision, stop.location[1] / locationPrecision]}
                    key={stop.id}
                >
                    <StopMarker stop={stop} useStopCode={useStopCode} />
                </MarkerView>
            ))}

            {data.vehicles.map((vehicle) => (
                <AnimatedMarker
                    coordinate={[
                        vehicle.location[0] / locationPrecision,
                        vehicle.location[1] / locationPrecision,
                    ]}
                    key={vehicle.id}
                >
                    <VehicleMarker vehicle={vehicle} showBrigade={showBrigade} showFleet={showFleet} />
                </AnimatedMarker>
            ))}

            {data.dotVehicles && <DotVehicles vehicles={data.dotVehicles} />}

            <InteractiveMarkers
                vehicles={data.vehicles}
                stops={data.stops}
                showBrigade={showBrigade}
                showFleet={showFleet}
            />
        </Portal>
    );
};
