import { useTheme } from "~/hooks/useTheme";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useRef } from "react";
import { BackHandler } from "react-native";

type Props = {
    open: boolean;
    children: React.ReactNode;
    onClose?: () => void;
};

export default ({ open, children, onClose }: Props) => {
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
            onClose?.();

            return true;
        });

        return () => sub.remove();
    }, [open, bottomSheetRef, onClose]);

    return (
        <BottomSheetModal
            index={open ? 0 : -1}
            ref={bottomSheetRef}
            backgroundStyle={{ backgroundColor: theme.colors.surface }}
            handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
            enablePanDownToClose
            backdropComponent={(props) => (
                <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
            )}
            onDismiss={onClose}
        >
            {children}
        </BottomSheetModal>
    );
};
