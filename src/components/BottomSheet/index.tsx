import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTheme } from "~/hooks/useTheme";
import { BackHandler } from "react-native";
import { useEffect, useRef } from "react";
import BottomSheetHeader, { BottomSheetHeaderActions } from "./BottomSheetHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    open: boolean;
    backdrop?: boolean;
    headerLeftComponent?: React.ReactNode;
    headerActions?: BottomSheetHeaderActions;
    children: React.ReactNode;
    onClose?: () => void;
};

export default ({ open, backdrop, headerLeftComponent, headerActions, children, onClose }: Props) => {
    const { bottom } = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!bottomSheetRef.current) return;

        if (open) {
            bottomSheetRef.current.present();
        } else {
            bottomSheetRef.current.close();
        }
    }, [open, bottomSheetRef]);

    useEffect(() => {
        if (!open) return;

        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            bottomSheetRef.current?.close();

            return true;
        });

        return () => sub.remove();
    }, [open, bottomSheetRef, onClose]);

    return (
        <BottomSheetModal
            index={0}
            ref={bottomSheetRef}
            backgroundStyle={{ backgroundColor: theme.colors.surface }}
            handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
            handleComponent={() => (
                <BottomSheetHeader leftComponent={headerLeftComponent} actions={headerActions} />
            )}
            backdropComponent={
                backdrop
                    ? (props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
                    : undefined
            }
            onDismiss={onClose}
            children={children}
        />
    );
};
