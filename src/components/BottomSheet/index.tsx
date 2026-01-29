import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTheme } from "~/hooks/useTheme";
import { useEffect, useRef } from "react";
import useSystemBack from "~/hooks/useSystemBack";
import BottomSheetHeader, { BottomSheetHeaderActions } from "./BottomSheetHeader";

type Props = {
    open: boolean;
    backdrop?: boolean;
    headerLeftComponent?: React.ReactNode;
    headerActions?: BottomSheetHeaderActions;
    children: React.ReactNode;
    onClose?: () => void;
};

export default ({ open, backdrop, headerLeftComponent, headerActions, children, onClose }: Props) => {
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

    useSystemBack(() => {
        bottomSheetRef.current?.close();
        onClose?.();
        return true;
    }, open);

    return (
        <BottomSheetModal
            index={0}
            ref={bottomSheetRef}
            enableDynamicSizing={true}
            enablePanDownToClose={true}
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
            onAnimate={(fromIndex, toIndex) => {
                if (fromIndex === 0 && toIndex === -1) {
                }
            }}
            children={children}
        />
    );
};
