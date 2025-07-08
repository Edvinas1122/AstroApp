import { z } from 'astro:schema';
import { createServiceActionBuilder } from "./utils";

const uploadAction = createServiceActionBuilder(
    (c) => c.locals.runtime.env.Upload
);

export const upload = {
    link: uploadAction(
        z.object({
            name: z.string(),
            type: z.string(),
            size: z.number(),
            chat: z.string(),
        }),
        async (input, { service, email }) => service.chatUploadLink(
            input.chat,
            email,
            input
        )
    )
};