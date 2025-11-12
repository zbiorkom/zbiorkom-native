import React, { createContext, useState, useMemo, useContext, ReactNode } from "react";
import { MD3DarkTheme, MD3LightTheme, MD3Theme, PaperProvider } from "react-native-paper";
import { LightScheme, DarkScheme } from "material-color-lite";
import { useColorScheme } from "react-native";

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
                surface: scheme.surface,
                surfaceVariant: scheme.surfaceVariant,
                background: scheme.getTone("primary", colorScheme === "dark" ? 10 : 97),
                onBackground: scheme.getTone("primary", colorScheme === "dark" ? 97 : 10),
                error: scheme.error,
                errorContainer: scheme.errorContainer,
                onPrimary: scheme.onPrimary,
                onPrimaryContainer: scheme.onPrimaryContainer,
                onSecondary: scheme.onSecondary,
                onSecondaryContainer: scheme.onSecondaryContainer,
                onTertiary: scheme.onTertiary,
                onTertiaryContainer: scheme.onTertiaryContainer,
                onSurface: scheme.onSurface,
                onSurfaceVariant: scheme.onSurfaceVariant,
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
                elevation: defaultTheme.colors.elevation,
            },
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
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
