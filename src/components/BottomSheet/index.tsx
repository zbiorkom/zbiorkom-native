import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTheme } from "~/hooks/useTheme";
import { useCallback, useEffect, useRef } from "react";
import useSystemBack from "~/hooks/useSystemBack";
import BottomSheetHeader, { BottomSheetHeaderActions } from "./BottomSheetHeader";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    open: boolean;
    backdrop?: boolean;
    dynamicSizing?: boolean;
    headerLeftComponent?: React.ReactNode;
    headerActions?: BottomSheetHeaderActions;
    children: React.ReactNode;
    onClose?: () => void;
};

export default ({
    open,
    backdrop,
    dynamicSizing = true,
    headerLeftComponent,
    headerActions,
    children,
    onClose,
}: Props) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const isProgrammaticDismiss = useRef(false);
    const { theme } = useTheme();

    useEffect(() => {
        if (!bottomSheetRef.current) return;

        if (open) {
            isProgrammaticDismiss.current = false;
            bottomSheetRef.current.present();
        } else {
            isProgrammaticDismiss.current = true;
            bottomSheetRef.current.dismiss();
        }
    }, [open, bottomSheetRef]);

    const handleDismiss = useCallback(() => {
        if (isProgrammaticDismiss.current) {
            isProgrammaticDismiss.current = false;
            return;
        }

        onClose?.();
    }, [onClose]);

    useSystemBack(() => {
        bottomSheetRef.current?.close();

        return true;
    }, open);

    return (
        <BottomSheetModal
            index={0}
            ref={bottomSheetRef}
            enableDynamicSizing={dynamicSizing}
            enablePanDownToClose
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
            onDismiss={handleDismiss}
            snapPoints={["30%", "60%"]}
            maxDynamicContentSize={Dimensions.get("window").height * 0.6}
            children={children}
        />
    );
};

export const useBottomSheetPadding = () => {
    const { bottom } = useSafeAreaInsets();

    return {
        paddingTop: 8,
        paddingBottom: bottom,
        paddingHorizontal: 8,
    };
};
