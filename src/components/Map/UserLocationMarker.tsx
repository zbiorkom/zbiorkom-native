import { MarkerView } from "@maplibre/maplibre-react-native";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Defs, RadialGradient, Stop } from "react-native-svg";
import { useUserLocationData } from "~/hooks/useUserLocation";

const DOT_SIZE = 20;
const HEADING_SIZE = DOT_SIZE * 5;
const CONE_ANGLE = 70;

const cx = HEADING_SIZE / 2;
const cy = HEADING_SIZE / 2;
const r = HEADING_SIZE / 2;
const halfAngle = (CONE_ANGLE / 2) * (Math.PI / 180);
const startAngle = -Math.PI / 2 - halfAngle;
const endAngle = -Math.PI / 2 + halfAngle;
const conePath = [
    `M ${cx} ${cy}`,
    `L ${cx + r * Math.cos(startAngle)} ${cy + r * Math.sin(startAngle)}`,
    `A ${r} ${r} 0 0 1 ${cx + r * Math.cos(endAngle)} ${cy + r * Math.sin(endAngle)}`,
    "Z",
].join(" ");

const HeadingCone = () => (
    <Svg width={HEADING_SIZE} height={HEADING_SIZE}>
        <Defs>
            <RadialGradient id="hg" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#4A90D9" stopOpacity={0.55} />
                <Stop offset="100%" stopColor="#4A90D9" stopOpacity={0} />
            </RadialGradient>
        </Defs>
        <Path d={conePath} fill="url(#hg)" />
    </Svg>
);

export default ({ emoji }: { emoji?: string }) => {
    const { location, heading } = useUserLocationData();
    if (!location) return null;

    return (
        <MarkerView coordinate={[location.coords.longitude, location.coords.latitude]}>
            <View style={styles.container} collapsable={false} pointerEvents="none">
                {heading !== null && (
                    <View style={[styles.heading, { transform: [{ rotate: `${heading}deg` }] }]}>
                        <HeadingCone />
                    </View>
                )}

                {emoji ? (
                    <Text style={styles.emoji}>{emoji}</Text>
                ) : (
                    <View style={styles.dot} />
                )}
            </View>
        </MarkerView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: HEADING_SIZE,
        height: HEADING_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
    heading: {
        position: "absolute",
        width: HEADING_SIZE,
        height: HEADING_SIZE,
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: "#4285F4",
        borderWidth: 3,
        borderColor: "white",
    },
    emoji: {
        fontSize: DOT_SIZE,
        textAlign: "center",
    },
});
