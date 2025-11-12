import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { BottomNavigation, Icon } from "react-native-paper";

export default () => {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
            tabBar={({ navigation, state, descriptors, insets }) => (
                <BottomNavigation.Bar
                    navigationState={state}
                    safeAreaInsets={insets}
                    onTabPress={({ route, preventDefault }) => {
                        if (route.name === "more") {
                            console.log("More tab pressed");
                        }

                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (event.defaultPrevented) {
                            preventDefault();
                        } else {
                            navigation.navigate(route.name);
                        }
                    }}
                    renderIcon={({ route, focused, color }) => {
                        const { options } = descriptors[route.key];
                        return options.tabBarIcon?.({ focused, color, size: 24 });
                    }}
                    getLabelText={({ route }) => {
                        const { options } = descriptors[route.key];

                        return options.title;
                    }}
                />
            )}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Map",
                    tabBarIcon: ({ color }) => <Icon source="map" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: "More",
                    tabBarIcon: ({ color }) => <Icon source="dots-horizontal" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
};
