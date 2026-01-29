import BottomBar from "@/ui/BottomBar";
import { Icon } from "react-native-paper";
import { Tabs } from "expo-router";

export default () => {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                animation: "shift"
            }}
            tabBar={(props) => <BottomBar {...props} />}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color }) => <Icon source="map" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="schedules"
                options={{
                    tabBarIcon: ({ color }) => <Icon source="calendar-text" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="directions"
                options={{
                    tabBarIcon: ({ color }) => <Icon source="directions" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    tabBarIcon: ({ color }) => <Icon source="star" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    tabBarIcon: ({ color }) => <Icon source="dots-horizontal" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
};
