import { defaultDamping, defaultStiffness } from "./config-values";

import {
    FadeInDown,
    FadeInUp,
    FadeOutDown,
    FadeOutUp,
    LinearTransition as ReanimatedLinearTransition,
} from "react-native-reanimated";

export * from "./config-values";

const applySpringConfig = <T extends { springify: () => any }>(
    transition: T
) => {
    return transition
        .springify()
        .damping(defaultDamping)
        .stiffness(defaultStiffness);
};

export const LinearTransition = applySpringConfig(ReanimatedLinearTransition);
export const FadeInDownTransition = applySpringConfig(FadeInDown);
export const FadeOutDownTransition = applySpringConfig(FadeOutDown);
export const FadeInUpTransition = applySpringConfig(FadeInUp);
export const FadeOutUpTransition = applySpringConfig(FadeOutUp);
