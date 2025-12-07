import React from "react";
import { View } from "react-native";
import { MarkerView } from "@maplibre/maplibre-react-native";
import { Stop } from "@/tools/protobufTypings";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";
import RouteIcon, { defaultColors } from "../ui/RouteIcon";

type Props = {
    stop: Stop;
    useStopCode?: boolean;
};

export default ({ stop, useStopCode }: Props) => {
    const coordinate = [stop.location[0] / 1e6, stop.location[1] / 1e6];
    const color = defaultColors[stop.type[0]];
    const bearing = stop.bearing || 0;

    return (
        <MarkerView coordinate={coordinate}>
            <View pointerEvents="none" style={{ alignSelf: "center" }}>
                <Svg
                    width={30}
                    height={30}
                    viewBox="0 -4 30 30"
                    style={{ transform: [{ rotate: `${bearing}deg` }] }}
                >
                    <Circle cx="15" cy="15" r="11" fill={color} />

                    <G
                        fill="hsla(0, 0%, 100%, 0.8)"
                        transform={`translate(6, 6) scale(0.75) rotate(${-bearing} 12 12)`}
                    >
                        {useStopCode && stop.code && stop.code.length <= 2 ? (
                            <SvgText
                                x="12"
                                y="13.25"
                                fill="hsla(0, 0%, 100%, 0.8)"
                                fontSize="16"
                                fontWeight="bold"
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fontFamily="TIDUI"
                            >
                                {stop.code}
                            </SvgText>
                        ) : (
                            <RouteIcon type={stop.type[0]} color="hsla(0, 0%, 100%, 0.8)" size={24} />
                        )}
                    </G>

                    {stop.bearing !== undefined && (
                        <G transform="translate(15, 15) rotate(45) translate(-30, -30)">
                            <Path d="m10 19 5-5 5 5z" fill={color} transform="rotate(-45 19.5 13)" />
                        </G>
                    )}
                </Svg>
            </View>
        </MarkerView>
    );
};
