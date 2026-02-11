import { useEventQuery } from "~/hooks/useQuery";
import useMapView from "~/hooks/useMapView";
import { useShallow } from "zustand/shallow";
import VehicleMarker from "./PositionMarker";
import DotPositions from "./DotPositions";
import { Portal } from "~/hooks/Portal";
import InteractiveMarkers from "./InteractiveMarkers";
import useSettings from "~/hooks/useSettings";
import StopMarker from "./StopMarker";
import { MarkerView } from "@maplibre/maplibre-react-native";
import AnimatedMarker from "./AnimatedMarker";
import { useCity } from "~/hooks/useBackend";
import { DotPosition, EPosition, EStop, Position, Stop } from "~/tools/typings";

export default () => {
    const [bounds, zoom] = useMapView(useShallow((state) => [state.bounds!, state.zoom!]));
    const { showBrigade, showFleet, useStopCode } = useSettings();
    const [city] = useCity();

    const { data, initialData } = useEventQuery<
        { positions?: Position[]; dots?: DotPosition[] },
        { stops: Stop[] }
    >(city?.id || "", `mapFeatures/${zoom}/${bounds?.join(",")}/stream`, {
        enabled: !!city && !!bounds,
    });

    return (
        <Portal host="map">
            {initialData?.stops?.map((stop) => (
                <MarkerView coordinate={stop[EStop.location]} key={stop[EStop.id]}>
                    <StopMarker stop={stop} useStopCode={useStopCode} />
                </MarkerView>
            ))}

            {data?.positions?.map((position) => (
                <AnimatedMarker coordinate={position[EPosition.location]} key={position[EPosition.id]}>
                    <VehicleMarker position={position} showBrigade={showBrigade} showFleet={showFleet} />
                </AnimatedMarker>
            ))}

            {data?.dots && <DotPositions dotPositions={data.dots} />}

            <InteractiveMarkers
                positions={data?.positions || []}
                stops={initialData?.stops || []}
                showBrigade={showBrigade}
                showFleet={showFleet}
            />
        </Portal>
    );
};
