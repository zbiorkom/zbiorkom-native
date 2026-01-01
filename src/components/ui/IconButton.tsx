import { useState } from "react";
import { StyleSheet } from "react-native";
import { Icon, TouchableRipple } from "react-native-paper";
import { useTheme } from "~/hooks/useTheme";

type Props = {
    icon: string;
    onPress?: () => void;
    square?: boolean;
};

export default ({ icon, onPress, square }: Props) => {
    const [isPressed, setIsPressed] = useState(false);
    const { theme } = useTheme();

    return (
        <TouchableRipple
            style={{
                backgroundColor: theme.colors.secondaryContainer,
                borderRadius: isPressed ? 12 : 24,
                paddingHorizontal: square ? 12 : 6,
                paddingVertical: 12,
            }}
            borderless
            onPress={onPress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
        >
            <Icon source={icon} size={22} color={theme.colors.onSecondaryContainer} />
        </TouchableRipple>
    );
};
