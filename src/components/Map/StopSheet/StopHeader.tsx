import RouteIcon, { defaultColors } from "@/ui/RouteIcon";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Svg, { G, Path } from "react-native-svg";
import { useTheme } from "~/hooks/useTheme";
import { darkFilter } from "~/tools/constants";
import { Stop } from "~/tools/protobufTypings";

export default ({ stop }: { stop: Stop }) => {
    const { colorScheme } = useTheme();

    return (
        <View style={styles.container}>
            <Svg
                width={40}
                height={40}
                viewBox="0 0 40 40"
                style={colorScheme === "dark" ? { filter: darkFilter } : {}}
            >
                <Path
                    d="M4.211 19.248C4.211 10.943 11.28 4.211 20 4.211s15.789 6.733 15.789 15.038v10.526c0 3.321-2.827 6.014-6.315 6.014a6.55 6.55 0 0 1-2.871-.656c-.439-.214-.877-.448-1.317-.683-1.548-.828-3.118-1.668-4.836-1.668h-.899c-1.718 0-3.289.84-4.836 1.668-.44.235-.878.469-1.317.683a6.54 6.54 0 0 1-2.872.656c-3.488 0-6.316-2.693-6.316-6.015z"
                    fill={defaultColors[stop.type[0]]}
                />

                <G fill="hsla(0, 0%, 100%, 0.8)" transform="translate(8, 8)">
                    <RouteIcon type={stop.type[0]} color="hsla(0, 0%, 100%, 0.8)" size={24} />
                </G>
            </Svg>

            <Text variant="titleMedium">
                {stop.name} {stop.code || ""}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});
