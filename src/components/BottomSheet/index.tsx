import { useTheme } from "@/hooks/useTheme";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

type Props = {
    open: boolean;
    children: React.ReactNode;
};

export default ({ open, children }: Props) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const { theme } = useTheme();
    const router = useRouter();

    useEffect(() => {
        if (!bottomSheetRef.current) return;

        if (open) {
            bottomSheetRef.current.expand();
        } else {
            bottomSheetRef.current.close();
        }
    }, [open, bottomSheetRef]);

    return (
        <BottomSheetModal
            index={open ? 0 : -1}
            ref={bottomSheetRef}
            snapPoints={["50%"]}
            backgroundStyle={{ backgroundColor: theme.colors.background }}
            handleIndicatorStyle={{ backgroundColor: theme.colors.onBackground }}
            enablePanDownToClose
            // onClose={enableClosing && router.canGoBack() ? () => router.back() : undefined}
        >
            {children}
        </BottomSheetModal>
    );
};
