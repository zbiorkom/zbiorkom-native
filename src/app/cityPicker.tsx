import { StyleSheet } from "react-native";
import { List, Searchbar } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useCities } from "~/hooks/useBackend";
import { City } from "~/tools/typings";
import { useRouter } from "expo-router";
import { useState, useMemo, useEffect } from "react";
import * as Location from "expo-location";
import { useTopBar } from "@/ui/TopBar";
import { useSettingsStore } from "~/hooks/useSettings";
import { useTheme } from "~/hooks/useTheme";

export default function SelectCityScreen() {
    const { t } = useTranslation("welcome");
    const cities = useCities();
    const router = useRouter();
    const { theme } = useTheme();
    const setCurrentCity = useSettingsStore((state) => state.setCurrentCity);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCities = useMemo(() => {
        if (searchQuery) {
            return cities.filter((city) => city.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        return cities;
    }, [cities, searchQuery]);

    const handleCitySelect = (city: City) => {
        setCurrentCity(city.id);
        router.replace("/(tabs)");
    };

    const { Container } = useTopBar({
        title: t("select_city"),
        showBackButton: true,
        stickyComponent: (
            <Searchbar
                placeholder={t("search_city")}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchbar}
            />
        ),
    });

    return (
        <Container>
            {filteredCities.map((item, i) => (
                <List.Item
                    key={item.id}
                    title={item.name}
                    description={item.description}
                    onPress={() => handleCitySelect(item)}
                    left={(props) => <List.Icon {...props} icon="city" />}
                    borderless
                    style={[
                        styles.city,
                        { backgroundColor: theme.colors.elevation.level3 },
                        i === 0 && styles.firstCity,
                        i === filteredCities.length - 1 && styles.lastCity,
                    ]}
                />
            ))}
        </Container>
    );
}

const styles = StyleSheet.create({
    city: {
        borderRadius: 4,
        marginHorizontal: 16,
        marginVertical: 2,
    },
    firstCity: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    lastCity: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    searchbar: {
        margin: 16,
    },
});
