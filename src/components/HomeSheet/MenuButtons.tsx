import { useTheme } from "@/hooks/useTheme";
import { Href, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";

type Button = {
    label: string;
    icon: string;
    route: Href;
};

const buttons: Button[] = [
    {
        label: "Rozkład jazdy",
        icon: "calendar-text",
        route: "/test",
    },
    {
        label: "Rozkład jazdy",
        icon: "calendar-text",
        route: "/test",
    },
    {
        label: "Rozkład jazdy",
        icon: "calendar-text",
        route: "/test",
    },
    {
        label: "Rozkład jazdy",
        icon: "calendar-text",
        route: "/test",
    },
    {
        label: "Rozkład jazdy",
        icon: "calendar-text",
        route: "/test",
    },
];

export default () => {
    const router = useRouter();
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            {buttons.map((button, index) => (
                <Button
                    key={index}
                    icon={button.icon}
                    mode="text"
                    onPress={() => router.navigate(button.route)}
                >
                    {button.label}
                </Button>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        gap: 2,
    },
});
