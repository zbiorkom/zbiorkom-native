import Markers from "./Markers";
import FabButtons from "./FabButtons";
import useMapSheets from "~/hooks/useMapSheets";
import { useShallow } from "zustand/shallow";
import MarkersClickedSheet from "./MarkersClickedSheet";
import StopSheet from "./StopSheet";
import UserLocationMarker from "./UserLocationMarker";
import { Portal } from "~/hooks/Portal";
import TripSheet from "./TripSheet";

export default () => {
    const openSheet = useMapSheets(useShallow((state) => state.stack.at(-1)));

    return (
        <>
            <Portal host="map">
                <UserLocationMarker  />
            </Portal>

            {(!openSheet || openSheet === "MarkersClicked") && (
                <>
                    <Markers />
                </>
            )}

            <FabButtons />
            <MarkersClickedSheet open={openSheet === "MarkersClicked"} />
            <StopSheet open={openSheet === "Stop"} />
            <TripSheet open={openSheet === "Trip"} />
        </>
    );
};
