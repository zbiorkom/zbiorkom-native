import { StyleSheet, View } from "react-native";
import IconButton from "@/ui/IconButton";

export type BottomSheetHeaderActions = { icon: string; onPress: () => void }[];

type Props = {
    leftComponent: React.ReactNode;
    actions?: BottomSheetHeaderActions;
};

export default ({ leftComponent, actions }: Props) => {
    return (
        <View>
            <View style={styles.handle} />

            <View style={styles.container}>
                <View style={styles.leftComponent}>{leftComponent}</View>

                {actions?.length && (
                    <View style={styles.actionButtons}>
                        {actions.map((action, index) => (
                            <IconButton
                                key={`bottom-sheet-header-action-${index}`}
                                icon={action.icon}
                                onPress={action.onPress}
                            />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 8,
    },
    handle: {
        width: 32,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#79747e",
        alignSelf: "center",
        marginTop: 8,
    },
    leftComponent: {
        paddingVertical: 6,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 8,
    },
});
