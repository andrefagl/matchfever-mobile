import { messages } from "@/constants";
import { z } from "zod";

export const setNameSchema = z.object({
    name: z
        .string()
        .min(1, { message: messages.platform.name.required })
        .min(2, { message: messages.platform.name.invalid }),
});

export type SetNameSchema = z.infer<typeof setNameSchema>;
