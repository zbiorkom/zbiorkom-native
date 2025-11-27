import React, { createContext, useState, useMemo, useContext, ReactNode } from "react";
import { configureFonts, MD3DarkTheme, MD3LightTheme, MD3Theme, PaperProvider } from "react-native-paper";
import { LightScheme, DarkScheme } from "material-color-lite";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";

interface ThemeContextData {
    theme: MD3Theme;
    sourceColor: string;
    setSourceColor: (color: string) => void;
    colorScheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextData>({
    theme: MD3DarkTheme,
    sourceColor: "#266b29",
    setSourceColor: () => {},
    colorScheme: "dark",
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [sourceColor, setSourceColor] = useState<string>("#266b29");
    const colorScheme = useColorScheme() ?? "dark";

    const theme = useMemo(() => {
        const scheme = new (colorScheme === "dark" ? DarkScheme : LightScheme)(sourceColor, false);
        const defaultTheme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;

        return {
            ...defaultTheme,
            colors: {
                primary: scheme.primary,
                primaryContainer: scheme.primaryContainer,
                secondary: scheme.secondary,
                secondaryContainer: scheme.secondaryContainer,
                tertiary: scheme.tertiary,
                tertiaryContainer: scheme.tertiaryContainer,
                surface: scheme.getTone("neutralVariant", colorScheme === "dark" ? 20 : 92),
                onSurface: scheme.getTone("neutralVariant", colorScheme === "dark" ? 90 : 20),
                surfaceVariant: scheme.surfaceVariant,
                onSurfaceVariant: scheme.onSurfaceVariant,
                background: scheme.background,
                onBackground: scheme.onBackground,
                error: scheme.error,
                errorContainer: scheme.errorContainer,
                onPrimary: scheme.onPrimary,
                onPrimaryContainer: scheme.onPrimaryContainer,
                onSecondary: scheme.onSecondary,
                onSecondaryContainer: scheme.onSecondaryContainer,
                onTertiary: scheme.onTertiary,
                onTertiaryContainer: scheme.onTertiaryContainer,
                onError: scheme.onError,
                onErrorContainer: scheme.onErrorContainer,
                outline: scheme.outline,
                outlineVariant: scheme.outlineVariant,
                inverseSurface: scheme.inverseSurface,
                inverseOnSurface: scheme.inverseOnSurface,
                inversePrimary: scheme.inversePrimary,
                shadow: scheme.shadow,
                scrim: scheme.scrim,

                surfaceDisabled: defaultTheme.colors.surfaceDisabled,
                onSurfaceDisabled: defaultTheme.colors.onSurfaceDisabled,
                backdrop: defaultTheme.colors.backdrop,

                elevation: {
                    level0: scheme.getTone("neutralVariant", colorScheme === "dark" ? 6 : 100),
                    level1: scheme.getTone("neutralVariant", colorScheme === "dark" ? 12 : 95),
                    level2: scheme.getTone("neutralVariant", colorScheme === "dark" ? 18 : 90),
                    level3: scheme.getTone("neutralVariant", colorScheme === "dark" ? 24 : 85),
                    level4: scheme.getTone("neutralVariant", colorScheme === "dark" ? 30 : 80),
                    level5: scheme.getTone("neutralVariant", colorScheme === "dark" ? 36 : 75),
                },
            },
            fonts: configureFonts({
                config: { fontFamily: "TIDUI" },
                isV3: true,
            }),
        };
    }, [sourceColor, colorScheme]);

    const contextValue = useMemo(
        () => ({
            theme,
            sourceColor,
            setSourceColor,
            colorScheme,
        }),
        [theme, sourceColor]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            <PaperProvider theme={theme}>{children}</PaperProvider>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
