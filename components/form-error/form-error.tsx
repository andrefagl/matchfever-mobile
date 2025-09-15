import React from "react";
import { Text } from "@/components/ui/text";

export const FormError = ({ children }: React.PropsWithChildren) => {
    return (
        <Text className='text-error-500 text-md px-1 text-center'>
            {children}
        </Text>
    );
};
