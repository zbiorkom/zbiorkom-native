import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { useMemo, useState, useEffect, useRef } from "react";
import { useTheme } from "~/hooks/useTheme";
import { useTopBar } from "@/ui/TopBar";
import { useFetchQuery } from "~/hooks/useQuery";
import { useCity } from "~/hooks/useBackend";
import { Stop, StopTimetable as IStopTimetable, EStop, EStopTimetableDeparture } from "~/tools/typings";
import LoadingState from "@/ui/LoadingState";
import Tabs from "@/ui/Tabs";
import { dayKeyToDate } from "~/tools/index";
import TripSummarySheet from "./TripSummarySheet";
import StopRoutesList from "@/Schedules/StopRoutesList";
import StopTimetable from "@/Schedules/StopTimetable";

export default () => {
    const { route, stop } = useLocalSearchParams();
    const { colorScheme } = useTheme();
    const [city] = useCity();
    const { t } = useTranslation("days");
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [selectedTripIdx, setSelectedTripIdx] = useState<number>();
    const cachedStopData = useRef<Stop | null>(null);

    const { data, loadingState } = useFetchQuery<{ stop: Stop; timetable: IStopTimetable }>(
        city.id,
        `stops/${stop}/timetable/${route}`,
        { resetDataOnKeyChange: true },
    );

    useEffect(() => {
        if (data?.stop) {
            cachedStopData.current = data.stop;
        }
    }, [data?.stop]);

    const stopRoutes = useMemo(() => {
        const stopInfo = data?.stop || cachedStopData.current;
        if (!stopInfo) return [];
        return stopInfo[EStop.routes];
    }, [data?.stop]);

    const dateKeys = Object.keys(data?.timetable || {});

    const safeDateIndex = selectedDateIndex >= dateKeys.length ? 0 : selectedDateIndex;

    useEffect(() => {
        if (selectedDateIndex >= dateKeys.length && dateKeys.length > 0) {
            setSelectedDateIndex(0);
        }
    }, [dateKeys.length, selectedDateIndex]);

    const hourGroups = useMemo(() => {
        if (!data?.timetable || !dateKeys.length) return [];
        const map = new Map<number, { minute: number; tripIdx: number }[]>();

        const deps = data.timetable[dateKeys[safeDateIndex]];
        if (!deps) return [];

        for (const dep of deps) {
            const date = new Date(dep[EStopTimetableDeparture.timestamp]);
            const hour = date.getHours();
            const minute = date.getMinutes();
            const tripIdx = dep[EStopTimetableDeparture.tripIdx];

            if (!map.has(hour)) map.set(hour, []);
            map.get(hour)!.push({ minute, tripIdx });
        }

        return [...map.entries()].map(([hour, minutes]) => ({ hour, minutes }));
    }, [data?.timetable, dateKeys, safeDateIndex]);

    const stopInfo = data?.stop || cachedStopData.current;

    const { Container } = useTopBar({
        title: stopInfo ? stopInfo[EStop.name] : "Rozkład przystanku",
        showBackButton: true,
        stickyComponent:
            stopRoutes.length > 0 || dateKeys.length > 0 ? (
                <View>
                    <StopRoutesList 
                        routes={stopRoutes} 
                        currentRoute={route as string} 
                        colorScheme={colorScheme} 
                    />
                    {dateKeys.length > 0 && (
                        <Tabs
                            items={dateKeys.map((key) => {
                                const date = dayKeyToDate(key);

                                return `${t(date.getDay().toString())} ${date.getDate()}.${(date.getMonth() + 1).toString().padStart(2, "0")}`;
                            })}
                            selectedIndex={safeDateIndex}
                            onSelect={setSelectedDateIndex}
                        />
                    )}
                </View>
            ) : undefined,
    });

    return (
        <Container>
            <LoadingState loadingState={loadingState} />

            {data && <StopTimetable hourGroups={hourGroups} onTripSelect={setSelectedTripIdx} />}

            <TripSummarySheet tripIdx={selectedTripIdx} onClose={() => setSelectedTripIdx(undefined)} />
        </Container>
    );
};
