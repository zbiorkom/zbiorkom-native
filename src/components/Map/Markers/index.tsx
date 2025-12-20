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
import AnimatedMarker from "./AnimatedMarker";
import { useCity } from "~/hooks/useBackend";
import { normalizeLocation } from "~/tools/constants";

export default () => {
    const [bounds, zoom] = useMapView(useShallow((state) => [state.bounds!, state.zoom!]));
    const { showBrigade, showFleet, useStopCode } = useSettings();
    const [city] = useCity();

    const { data } = useWebsocketSubscription("subscribeMapFeatures", {
        options: {
            city: city?.id || "",
            bounds,
            zoom,
            filterRoutes: [],
            filterModels: [],
        },
        disabled: !bounds || !zoom || !city,
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
                    coordinate={normalizeLocation(stop.location)}
                    key={stop.id}
                >
                    <StopMarker stop={stop} useStopCode={useStopCode} />
                </MarkerView>
            ))}

            {data.vehicles.map((vehicle) => (
                <AnimatedMarker
                    coordinate={normalizeLocation(vehicle.location)}
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
