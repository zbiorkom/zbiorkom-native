import { useState } from "react";
import { useTopBar } from "@/ui/TopBar";
import useSettings from "~/hooks/useSettings";
import { useCities, useCity } from "~/hooks/useBackend";
import { View } from "react-native";
import { Switch } from "react-native-gesture-handler";
import { Button, IconButton, Text, Menu } from "react-native-paper";

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

    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const cities = useCities();
    const [currentCity, setCurrentCity] = useCity();

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
                <Text>Miasto</Text>
                <Menu
                    visible={visible}
                    onDismiss={closeMenu}
                    anchor={<Button onPress={openMenu}>{currentCity?.name || "Wybierz"}</Button>}
                >
                    {cities?.map((city) => (
                        <Menu.Item
                            key={city.id}
                            onPress={() => {
                                setCurrentCity(city.id);
                                closeMenu();
                            }}
                            title={city.name}
                        />
                    ))}
                </Menu>
            </View>
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
