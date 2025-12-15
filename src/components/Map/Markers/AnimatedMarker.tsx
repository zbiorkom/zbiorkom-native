import { Point } from "~/tools/typings";
import { MarkerView } from "@maplibre/maplibre-react-native";
import { useEffect, useState } from "react";
import { Easing, useAnimatedReaction, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

type Props = {
    coordinate: Point;
    children: React.ReactElement;
};

export default ({ coordinate: [lon, lat], children }: Props) => {
    const [currentCoord, setCurrentCoord] = useState([lon, lat]);

    const lonAnim = useSharedValue(lon);
    const latAnim = useSharedValue(lat);

    useEffect(() => {
        const distance =
            Math.pow((lon - lonAnim.value) * 111320, 2) +
            Math.pow((lat - latAnim.value) * 110540, 2);

        const duration = Math.min(Math.max((Math.sqrt(distance) / 70) * 350, 70), 350);

        lonAnim.value = withTiming(lon, { duration, easing: Easing.linear });
        latAnim.value = withTiming(lat, { duration, easing: Easing.linear });
    }, [lon, lat]);

    useAnimatedReaction(
        () => [lonAnim.value, latAnim.value],
        (curr) => scheduleOnRN(setCurrentCoord, curr)
    );

    return <MarkerView coordinate={currentCoord}>{children}</MarkerView>;
};
