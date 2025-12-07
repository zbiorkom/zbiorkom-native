import { useWebsocketSubscription } from "@/hooks/useWebsocket";
import useMapView from "@/hooks/useMapView";
import { useShallow } from "zustand/shallow";
import VehicleMarker from "./VehicleMarker";
import DotVehicles from "./DotVehicles";
import { Portal } from "@/hooks/Portal";
import InteractiveMarkers from "./InteractiveMarkers";
import useSettings from "@/hooks/useSettings";
import StopMarker from "./StopMarker";

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
                <StopMarker key={stop.id} stop={stop} useStopCode={useStopCode} />
            ))}

            {data.vehicles.map((vehicle) => (
                <VehicleMarker
                    key={vehicle.id}
                    vehicle={vehicle}
                    showBrigade={showBrigade}
                    showFleet={showFleet}
                />
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
