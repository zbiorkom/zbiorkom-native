import { useEffect, useRef } from "react";
import { BackHandler } from "react-native";

type Handler = () => boolean;

export default (handler: Handler, enabled = true) => {
    const handlerRef = useRef<Handler>(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!enabled) return;

        const onBack = () => {
            const result = handlerRef.current?.();
            return result === true;
        };

        const sub = BackHandler.addEventListener("hardwareBackPress", onBack);

        return () => sub.remove();
    }, [enabled]);
};
