import {Elysia, t} from "elysia";
import {Videos} from "../models/videoModels";
import {getUserId, userService} from "./userController";
import {Generator, rateLimit} from "elysia-rate-limit";

const keyGenerator: Generator<{ ip: string }> = async (req, server, {ip}) => Bun.hash(JSON.stringify(ip)).toString()

export const videoController = new Elysia({prefix: '/videos'})
    .use(userService)
    .decorate('video', new Videos())
    .use(getUserId)
    .use((rateLimit({
        scoping: 'scoped',
        max: 1,
        duration: 1000,
        generator: keyGenerator,
        errorResponse: 'You are doing too many requests',
    })))
    .put('/add', async ({userInfo, video, body: {videoId}, error}) => {
        console.log(videoId)
        return video.addVideo(userInfo.id, videoId)
    }, {
        body: t.Object({
            videoId: t.String({minLength: 5})
        }),
        isSignIn: true
    })
    .get('/info/:id', async ({params: {id}, video}) => {
        return video.getInfo(id)
    })
    .get('/null', async ({video}) => {
        return video.getNull()
    })