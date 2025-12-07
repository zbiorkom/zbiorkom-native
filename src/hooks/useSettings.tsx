import { useMMKVBoolean } from "react-native-mmkv";

export default () => {
    const [showFleet, setShowFleet] = useMMKVBoolean("showFleet");
    const [showBrigade, setShowBrigade] = useMMKVBoolean("showBrigade");
    const [useStopCode, setUseStopCode] = useMMKVBoolean("useStopCode");

    return {
        showFleet,
        setShowFleet,
        showBrigade,
        setShowBrigade,
        useStopCode,
        setUseStopCode,
    };
};
