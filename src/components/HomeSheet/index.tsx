import { BottomSheetView } from "@gorhom/bottom-sheet";
import BottomSheet from "../BottomSheet";
import { StyleSheet, Text } from "react-native";
import { Button, Searchbar } from "react-native-paper";
import { useState } from "react";
import MenuButtons from "./MenuButtons";

export default () => {
    return (
        <>
            <BottomSheet open>
                <BottomSheetView style={styles.container}>
                    <Button
                        icon="camera"
                        mode="contained-tonal"
                        onPress={() => console.log("Pressed")}
                        // move everything to the left, but make button width 100%
                        contentStyle={{
                            alignSelf: "flex-start",
                            width: "100%",
                            alignContent: "flex-start",
                            justifyContent: "flex-start",
                            // add space between icon and text
                            paddingRight: 16,
                        }}
                        labelStyle={{ textAlign: "left", paddingLeft: 8 }}
                    >
                        Wyszukaj przystanek
                    </Button>
                    <MenuButtons />
                </BottomSheetView>
            </BottomSheet>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
    },
});
