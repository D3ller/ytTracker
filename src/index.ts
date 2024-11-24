import {Elysia, error, t} from "elysia";
import {swagger} from '@elysiajs/swagger'
import { opentelemetry } from '@elysiajs/opentelemetry'
import { jwt } from "@elysiajs/jwt";
import { cors } from '@elysiajs/cors'

import {userController} from "./controllers/userController";
import {statsController, videoController} from "./controllers/videoControllers";


const app = new Elysia()
    .use(opentelemetry())
    .use(swagger())
    .use(jwt({
        name: 'jwt',
        secret: Bun.env.JWT_SECRET || 'secret',
    }))
    .onError(({ error, code }) => {
        if (code === 'NOT_FOUND') return

        console.error(error)
    })
    .use(cors())
    .use(videoController)
    .use(userController)
    .use(statsController)
    .listen(3000);

console.log(
    `👺 Le serveur est lancé sur http://${app.server?.hostname}:${app.server?.port}`
);
