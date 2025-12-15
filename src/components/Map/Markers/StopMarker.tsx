import Svg, { G, Path, Text } from "react-native-svg";
import RouteIcon, { defaultColors } from "@/ui/RouteIcon";
import { Stop } from "~/tools/protobufTypings";
import { View } from "react-native";
import React from "react";

type Props = {
    stop: Stop;
    useStopCode?: boolean;
};

export default ({ stop, useStopCode }: Props) => {
    const showStopCode = useStopCode && stop.code && stop.code.length <= 2;
    const color = defaultColors[stop.type[0]];
    const bearing = (stop.bearing || 0) + 45;

    if (stop.station) {
        return (
            <View pointerEvents="none" style={{ alignSelf: "center" }}>
                <Svg width={40} height={40} viewBox="0 0 40 40">
                    <Path
                        d="M24.251 5.313c6.602-2.867 13.303 3.833 10.436 10.436l-.474 1.092a7.93 7.93 0 0 0 0 6.32l.474 1.092c2.867 6.602-3.833 13.303-10.436 10.436l-1.092-.474a7.93 7.93 0 0 0-6.32 0l-1.092.474C9.145 37.556 2.444 30.856 5.311 24.253l.474-1.092a7.93 7.93 0 0 0 0-6.32l-.474-1.092C2.444 9.147 9.144 2.446 15.747 5.313l1.092.474a7.93 7.93 0 0 0 6.32 0z"
                        fill={color}
                    />

                    <G fill="hsla(0, 0%, 100%, 0.8)" transform="translate(8, 8)">
                        <RouteIcon type={stop.type[0]} color="hsla(0, 0%, 100%, 0.8)" size={24} />
                    </G>
                </Svg>
            </View>
        );
    }

    return (
        <View pointerEvents="none" style={{ alignSelf: "center", transform: [{ rotate: `${bearing}deg` }] }}>
            <Svg width={30} height={30} viewBox="-4 -4 40 40">
                <Path
                    d="M12.556 7.628c5.578-5.386 14.466-5.231 19.852.347s5.231 14.466-.346 19.852l-4.661 4.501c-5.578 5.386-14.466 5.231-19.852-.346-5.386-5.578-5.231-14.466.347-19.852z"
                    fill={color}
                />

                <Path
                    d="M11.667 23.333 20 15l8.333 8.333z"
                    fill={color}
                    transform="rotate(-45 20 20) translate(0, -22)"
                />

                <G fill="hsla(0, 0%, 100%, 0.8)" transform={`translate(9, 9) rotate(${-bearing} 11 11)`}>
                    {showStopCode ? (
                        <Text
                            x="12"
                            y="12"
                            fill="hsla(0, 0%, 100%, 0.8)"
                            fontSize="16"
                            fontWeight="bolder"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fontFamily="TIDUI"
                        >
                            {stop.code}
                        </Text>
                    ) : (
                        <RouteIcon type={stop.type[0]} color="hsla(0, 0%, 100%, 0.8)" size={22} />
                    )}
                </G>
            </Svg>
        </View>
    );
};
