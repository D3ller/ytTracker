import {Elysia, t} from "elysia";
import {Videos} from "../models/videoModels";
import {getUserId, userService} from "./userController";

export const videoController = new Elysia({prefix: '/videos'})
    .use(userService)
    .decorate('video', new Videos())
    .use(getUserId)
    .get('/', ({userInfo, video}) => {
        return video.getRecentVideo(userInfo.id)
    }, {
        isSignIn: true
    })
    .put('/add', async ({userInfo, video, body: {videoId}, error}) => {
        return video.addVideo(userInfo.id, videoId)
    }, {
        body: t.Object({
            videoId: t.String({minLength: 10})
        }),
        isSignIn: true
    })

export const statsController = new Elysia({prefix: '/stats'})
    .use(userService)
    .decorate('video', new Videos())
    .get('/username/:id/:username', async ({params: {id, username}, video}) => {
        return video.getStatsByUsername(id, username)
    }, {
        params: t.Object({
            id: t.String(),
            username: t.String()

        }),
    })
    .use(getUserId)
    .get('/:id', async ({params: {id}, userInfo, video}) => {
        return video.getStats(id, userInfo.id)
    }, {
        params: t.Object({
            id: t.String()
        })
    })