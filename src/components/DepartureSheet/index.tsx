import { BottomSheetView } from "@gorhom/bottom-sheet";
import BottomSheet from "../BottomSheet";
import { StyleSheet, Text } from "react-native";
import { Button, Searchbar } from "react-native-paper";
import { useEffect, useState } from "react";
import { MarkerView } from "@maplibre/maplibre-react-native";
import { Portal } from "~/hooks/Portal";

export default ({ open }: { open: boolean }) => {
    const [departures, setDepartures] = useState<string>("");

    useEffect(() => {
        fetch("https://api.zbiorkom.live/5.0/warsaw/stops/getDepartures?id=centrum06")
            .then((res) => res.text())
            .then((data) => setDepartures(data));
    }, []);

    return (
        <>
            <BottomSheet open={open}>
                <BottomSheetView style={styles.container}>
                    {/* <Button
                        icon="magnify"
                        mode="contained-tonal"
                        onPress={() => console.log("Pressed")}
                        contentStyle={{
                            justifyContent: "flex-start",
                            paddingRight: 16,
                        }}
                        labelStyle={{ textAlign: "left", paddingLeft: 8 }}
                    >
                        {departures}
                    </Button> */}
                    <Text>{departures}</Text>
                </BottomSheetView>
            </BottomSheet>

            <Portal host="map">
                <MarkerView coordinate={[21, 52]} anchor={{ x: 0, y: 0 }}>
                    <Text>Test marker</Text>
                </MarkerView>
            </Portal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
    },
});
