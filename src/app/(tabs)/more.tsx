import { useTopBar } from "@/components/ui/TopBar";
import useSettings from "@/hooks/useSettings";
import { View } from "react-native";
import { Switch } from "react-native-gesture-handler";
import { Button, IconButton, Text } from "react-native-paper";

export default function MyScreen() {
    const { Container } = useTopBar({
        title: "Mój Tytułeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        rightComponent: <IconButton icon="dots-vertical" onPress={() => {}} />,
        addBottomPadding: true,
        stickyComponent: (
            <>
                <Button mode="contained" style={{ margin: 16 }}>
                    Przycisk w sticky
                </Button>
            </>
        ),
    });

    const { showFleet, setShowFleet, showBrigade, setShowBrigade, useStopCode, setUseStopCode } =
        useSettings();

    return (
        <Container>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    margin: 16,
                }}
            >
                <Text>Numer taborowy pojazdu</Text>
                <Switch value={showFleet} onValueChange={setShowFleet} />
            </View>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    margin: 16,
                }}
            >
                <Text>Numer brygady pojazdu</Text>
                <Switch value={showBrigade} onValueChange={setShowBrigade} />
            </View>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    margin: 16,
                }}
            >
                <Text>Kod przystanku zamiast nazwy</Text>
                <Switch value={useStopCode} onValueChange={setUseStopCode} />
            </View>
        </Container>
    );
}
