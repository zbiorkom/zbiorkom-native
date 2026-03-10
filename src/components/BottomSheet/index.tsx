import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTheme } from "~/hooks/useTheme";
import { useCallback, useEffect, useRef } from "react";
import useSystemBack from "~/hooks/useSystemBack";
import BottomSheetHeader, { BottomSheetHeaderAction } from "./BottomSheetHeader";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    open: boolean;
    backdrop?: boolean;
    dynamicSizing?: boolean;
    headerLeftComponent?: React.ReactNode;
    headerActions?: (BottomSheetHeaderAction | false | undefined)[];
    children: React.ReactNode;
    onClose?: (isSwipeDown?: boolean) => void;
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
    const skipDismiss = useRef(false);
    const isMounted = useRef(true);
    const { theme } = useTheme();

    useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (!bottomSheetRef.current) return;

        if (open) {
            skipDismiss.current = false;
            bottomSheetRef.current.present();
        } else {
            skipDismiss.current = true;
            bottomSheetRef.current.dismiss();
        }
    }, [open, bottomSheetRef]);

    const handleDismiss = useCallback(() => {
        if (skipDismiss.current || !isMounted.current) {
            skipDismiss.current = false;
            return;
        }

        onClose?.(true);
    }, [onClose]);

    useSystemBack(() => {
        skipDismiss.current = true;
        onClose?.(false);

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
                <BottomSheetHeader
                    leftComponent={headerLeftComponent}
                    actions={headerActions?.filter((action): action is BottomSheetHeaderAction => !!action)}
                />
            )}
            backdropComponent={
                backdrop
                    ? (props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
                    : undefined
            }
            onDismiss={handleDismiss}
            snapPoints={!dynamicSizing ? ["30%", "60%"] : undefined}
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
