import BottomSheet from "@/BottomSheet";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { MarkerView } from "@maplibre/maplibre-react-native";
import { Text } from "react-native-paper";
import { useShallow } from "zustand/shallow";
import { Portal } from "~/hooks/Portal";
import useMapSheets from "~/hooks/useMapSheets";
import StopMarker from "../Markers/StopMarker";
import useSettings from "~/hooks/useSettings";
import StopSheetHeader from "./StopSheetHeader";
import { normalizeLocation } from "~/tools/constants";
import { useEffect } from "react";
import { useMapNavigate } from "~/hooks/useMapView";
import { EStop } from "~/tools/typings";

export default ({ open }: { open: boolean }) => {
    const [stop, goBack] = useMapSheets(useShallow((state) => [state.stop, state.goBack]));
    const { useStopCode } = useSettings();
    const navigateTo = useMapNavigate();

    useEffect(() => {
        if (!open || !stop) return;

        navigateTo(normalizeLocation(stop[EStop.location]), 16);
    }, [open, stop]);

    if (!stop) return null;

    return (
        <>
            <BottomSheet
                open={open}
                headerLeftComponent={<StopSheetHeader stop={stop} />}
                headerActions={[
                    {
                        icon: "star-outline",
                        onPress: () => {
                            console.log("Pressed star outline");
                        },
                    },
                    {
                        icon: "dots-vertical",
                        onPress: () => {
                            console.log("Pressed dots vertical");
                        },
                    },
                ]}
                onClose={goBack}
            >
                <BottomSheetScrollView>
                    <Text variant="titleMedium" style={{ margin: 16 }}>
                        smth
                    </Text>
                </BottomSheetScrollView>
            </BottomSheet>

            {open && (
                <Portal host="map">
                    <MarkerView coordinate={normalizeLocation(stop[EStop.location])} key={stop[EStop.id]}>
                        <StopMarker stop={stop} useStopCode={useStopCode} />
                    </MarkerView>
                </Portal>
            )}
        </>
    );
};
