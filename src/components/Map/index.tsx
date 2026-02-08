import Markers from "./Markers";
import FabButtons from "./FabButtons";
import useMapSheets from "~/hooks/useMapSheets";
import { useShallow } from "zustand/shallow";
import MarkersClickedSheet from "./MarkersClickedSheet";
import StopSheet from "./StopSheet";

export default () => {
    const openSheet = useMapSheets(useShallow((state) => state.stack[state.stack.length - 1]));

    return (
        <>
            {(!openSheet || openSheet === "MarkersClicked") && (
                <>
                    <Markers />
                </>
            )}

            <FabButtons />
            <MarkersClickedSheet open={openSheet === "MarkersClicked"} />
            <StopSheet open={openSheet === "Stop"} />
        </>
    );
};
