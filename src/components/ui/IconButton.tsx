import { StyleSheet } from "react-native";
import { Icon, TouchableRipple } from "react-native-paper";
import { useTheme } from "~/hooks/useTheme";

type Props = {
    icon: string;
    onPress?: () => void;
};

export default ({ icon, onPress }: Props) => {
    const { theme } = useTheme();

    return (
        <TouchableRipple
            style={[styles.iconButton, { backgroundColor: theme.colors.secondaryContainer }]}
            borderless
            onPress={onPress}
        >
            <Icon source={icon} size={22} color={theme.colors.onSecondaryContainer} />
        </TouchableRipple>
    );
};

const styles = StyleSheet.create({
    iconButton: {
        paddingHorizontal: 6,
        paddingVertical: 12,
        borderRadius: 24,
    },
});
