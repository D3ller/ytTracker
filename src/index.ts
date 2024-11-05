import {Elysia, error, t} from "elysia";
import {swagger} from '@elysiajs/swagger'
import { opentelemetry } from '@elysiajs/opentelemetry'

import {user} from "./user";
import {videoController} from "./controllers/videoControllers";
import jwt from "@elysiajs/jwt";


const app = new Elysia().get("/", () => "Hello Elysia")
    .use(opentelemetry())
    .use(swagger())
    .use(jwt({
        name: 'jwt',
        secret: Bun.env.JWT_SECRET
    }))
    .onError(({ error, code }) => {
        if (code === 'NOT_FOUND') return

        console.error(error)
    })
    .use(videoController)
    .use(user)
    .listen(3000);

console.log(
    `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
