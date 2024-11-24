import {Elysia, error, t} from "elysia";
import {swagger} from '@elysiajs/swagger'
import { jwt } from "@elysiajs/jwt";
import { cors } from '@elysiajs/cors'
import { rateLimit } from 'elysia-rate-limit'


import {userController} from "./controllers/userController";
import {videoController} from "./controllers/videoControllers";
import {channelController} from "./controllers/channelController";
import {statsController} from "./controllers/statsController";


const app = new Elysia()
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
    .use(channelController)
    .listen(3000);

console.log(
    `👺 Le serveur est lancé sur http://${app.server?.hostname}:${app.server?.port}`
);
