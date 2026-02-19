import RouteIcon, { defaultColors } from "@/ui/RouteIcon";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Svg, { G, Path } from "react-native-svg";
import { useTheme } from "~/hooks/useTheme";
import { darkFilter } from "~/tools/constants";
import { EStop, Stop } from "~/tools/typings";

export default ({ stop }: { stop: Stop }) => {
    const { colorScheme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.vehicleTypes}>
                {stop[EStop.vehicleTypes].map((type, index) => (
                    <Svg
                        width={40}
                        height={40}
                        viewBox="0 0 40 40"
                        filter={colorScheme === "dark" ? darkFilter : undefined}
                        style={index !== 0 && styles.secondVehicleType}
                        key={`icon-${index}`}
                    >
                        <Path
                            d="M15.018 5.451c.376-.331.564-.497.737-.63a6.93 6.93 0 0 1 8.49 0c.173.134.361.299.737.631l.252.219a6.94 6.94 0 0 0 3.073 1.483c.081.017.163.031.328.061.493.088.739.132.951.184a6.96 6.96 0 0 1 5.294 6.653c.003.219-.009.469-.032.971-.008.168-.012.252-.014.334a7 7 0 0 0 .759 3.333c.038.074.077.147.157.295.238.441.357.662.449.86a6.97 6.97 0 0 1-1.889 8.296c-.169.139-.371.286-.777.58-.136.098-.204.148-.269.198a6.96 6.96 0 0 0-2.127 2.673 13 13 0 0 0-.132.307c-.195.462-.293.693-.391.888a6.94 6.94 0 0 1-7.649 3.692c-.214-.045-.455-.113-.937-.248-.161-.045-.242-.068-.322-.088a6.9 6.9 0 0 0-3.411 0c-.08.02-.161.043-.322.088a17 17 0 0 1-.937.248 6.94 6.94 0 0 1-7.649-3.692 17 17 0 0 1-.391-.888l-.132-.307a6.96 6.96 0 0 0-2.127-2.673c-.066-.05-.134-.099-.269-.198a17 17 0 0 1-.777-.58 6.97 6.97 0 0 1-1.889-8.296c.092-.199.211-.419.449-.86.08-.148.12-.221.157-.295a7 7 0 0 0 .759-3.333l-.014-.334a16 16 0 0 1-.032-.971 6.955 6.955 0 0 1 5.294-6.653c.212-.052.458-.096.951-.184.165-.029.247-.044.328-.061a6.94 6.94 0 0 0 3.073-1.483c.063-.053.126-.108.252-.219"
                            fill={defaultColors[type]}
                        />

                        <G fill="hsla(0, 0%, 100%, 0.8)" transform="translate(8, 8)">
                            <RouteIcon type={type} color="hsla(0, 0%, 100%, 0.8)" size={24} />
                        </G>
                    </Svg>
                ))}
            </View>

            <Text variant="titleMedium">
                {stop[EStop.name]} {stop[EStop.code] || ""}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    vehicleTypes: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 6,
    },
    secondVehicleType: {
        marginLeft: -20,
    },
});
