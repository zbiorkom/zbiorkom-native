import { useTheme } from "@/hooks/useTheme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useEffect, useRef } from "react";

type Props = {
    open: boolean;
    children: React.ReactNode;
};

export default ({ open, children }: Props) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { theme } = useTheme();
    console.log(theme.colors.surface)

    useEffect(() => {
        if (!bottomSheetRef.current) return;

        if (open) {
            bottomSheetRef.current.expand();
        } else {
            bottomSheetRef.current.close();
        }
    }, [open, bottomSheetRef]);

    return (
        <BottomSheet
            index={open ? 0 : -1}
            ref={bottomSheetRef}
            snapPoints={["50%"]}
            backgroundStyle={{ backgroundColor: theme.colors.background }}
            handleIndicatorStyle={{ backgroundColor: theme.colors.onBackground }}
        >
            {children}
        </BottomSheet>
    );
};
