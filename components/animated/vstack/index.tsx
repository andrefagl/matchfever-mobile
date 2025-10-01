import { VStack } from "@/components/ui/vstack";
import { LinearTransition } from "@/animations";
import Animated from "react-native-reanimated";

const AnimatedVStackComponent = Animated.createAnimatedComponent(VStack);

export const AnimatedVStack = ({ ...props }) => {
    return <AnimatedVStackComponent layout={LinearTransition} {...props} />;
};
