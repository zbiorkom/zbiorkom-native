import DirectionsForm from "@/Directions/DirectionsForm";
import { useTopBar } from "@/ui/TopBar";
import { Button, Text } from "react-native-paper";

export default () => {
    const { Container } = useTopBar({
        title: "Planer podróży",
        // rightComponent: <IconButton icon="dots-vertical" onPress={() => {}} />,
        addBottomPadding: true,
        stickyComponent: <DirectionsForm />,
    });

    return (
        <Container>
            <Text>halo</Text>
        </Container>
    );
};
