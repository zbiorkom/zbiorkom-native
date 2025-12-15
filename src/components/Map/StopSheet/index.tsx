import BottomSheet from "@/BottomSheet";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { MarkerView } from "@maplibre/maplibre-react-native";
import { Text } from "react-native-paper";
import { useShallow } from "zustand/shallow";
import { Portal } from "~/hooks/Portal";
import useMapSheets from "~/hooks/useMapSheets";
import { locationPrecision } from "~/tools/constants";
import StopMarker from "../Markers/StopMarker";
import useSettings from "~/hooks/useSettings";
import StopHeader from "./StopHeader";

export default ({ open }: { open: boolean }) => {
    const [stop, goBack] = useMapSheets(useShallow((state) => [state.stop, state.goBack]));
    const { useStopCode } = useSettings();

    if (!stop) return null;

    return (
        <>
            <BottomSheet
                open={open}
                headerLeftComponent={<StopHeader stop={stop} />}
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

            <Portal host="map">
                <MarkerView
                    coordinate={[stop.location[0] / locationPrecision, stop.location[1] / locationPrecision]}
                >
                    <StopMarker stop={stop} useStopCode={useStopCode} />
                </MarkerView>
            </Portal>
        </>
    );
};
