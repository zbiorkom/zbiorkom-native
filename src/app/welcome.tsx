import { View, StyleSheet } from "react-native";
import { Text, Button, useTheme as usePaperTheme } from "react-native-paper";
import { useTranslation, Trans } from "react-i18next";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const theme = usePaperTheme();
    const insets = useSafeAreaInsets();
    const [locationGranted, setLocationGranted] = useState<boolean | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.getForegroundPermissionsAsync();
            setLocationGranted(status === "granted");
        })();
    }, []);

    const requestLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationGranted(status === "granted");
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Image source={require("../../assets/images/icon.png")} style={styles.logo} contentFit="contain" />
                </View>

                <Text variant="headlineMedium" style={styles.welcomeText}>
                    <Trans
                        i18nKey="welcome.title"
                        components={{ bold: <Text style={{ fontWeight: "bold" }}>{""}</Text> }}
                    />
                </Text>

                {locationGranted === false && (
                    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.locationCard}>
                        <Text variant="bodyMedium" style={styles.locationText}>
                            {t("welcome.location_request")}
                        </Text>
                        <Button mode="contained-tonal" icon="map-marker" onPress={requestLocation}>
                            {t("welcome.grant_location")}
                        </Button>
                    </Animated.View>
                )}
            </View>

            <View style={styles.footer}>
                <Button 
                    mode="contained" 
                    icon="city" 
                    onPress={() => router.push("/cityPicker")}
                    contentStyle={{ height: 56 }}
                >
                    {t("welcome.select_city")}
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 24,
    },
    welcomeText: {
        textAlign: "center",
        marginBottom: 24,
    },
    locationCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: "rgba(128, 128, 128, 0.1)",
        marginBottom: 24,
        alignItems: "center",
        width: "100%",
    },
    locationText: {
        textAlign: "center",
        marginBottom: 12,
    },
    footer: {
        width: "100%",
        paddingBottom: 16,
    },
});
