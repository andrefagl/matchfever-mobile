import React from "react";
import { Image, ImageProps } from "react-native";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";

const brandLogoStyle = tva({
    base: "resize-contain",
    variants: {
        size: {
            sm: "w-12 h-12",
            md: "w-16 h-16",
            lg: "w-20 h-20",
            xl: "w-24 h-24",
        },
        variant: {
            light: "",
            dark: "",
        },
    },
    defaultVariants: {
        size: "md",
        variant: "light",
    },
});

type BrandLogoProps = Omit<ImageProps, "source"> &
    VariantProps<typeof brandLogoStyle> & { className?: string };

export const BrandLogo = ({
    className,
    size = "md",
    variant = "light",
    ...props
}: BrandLogoProps) => {
    const getImageSource = () => {
        return variant === "dark"
            ? require("../../assets/icons/splash-icon-dark.png")
            : require("../../assets/icons/splash-icon-light.png");
    };

    return (
        <Image
            source={getImageSource()}
            className={brandLogoStyle({ size, variant, class: className })}
            resizeMode='contain'
            {...props}
        />
    );
};
