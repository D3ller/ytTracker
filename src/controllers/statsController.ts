import {Elysia, t} from "elysia";
import {getUserId, userService} from "./userController";
import {Videos} from "../models/videoModels";

export const statsController = new Elysia({prefix: '/stats'})
    .use(userService)
    .model({
        id: t.Object({
            id: t.String()
        })
    })
    .decorate('video', new Videos())
    .post('/username/:id', async ({params: {id}, body: {username}, video}) => {
        return video.getStatsByUsername(id, username)
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            username: t.String({default: 'korqasssssssggaaaggs8'})
        })
    })
    .use(getUserId)
    .get('/', async ({userInfo, video}) => {
        return video.getStats("today", userInfo.id)
    })
    .get('/:id', async ({params: {id}, userInfo, video}) => {
        return video.getStats(id, userInfo.id)
    }, {
        params: 'id'
    })
    .get('/recent', async ({video, userInfo}) => {
        return video.getRecentVideos(userInfo.id)
    })
    .get('/popular', async ({video, userInfo}) => {
        return video.getPopularVideos("today", userInfo.id)
    })
    .get('/popular/:id', async ({params: {id}, video, userInfo}) => {
        return video.getPopularVideos(id, userInfo.id)
    }, {
        params: 'id'
    })
    .get('/videast', async ({video, userInfo}) => {
        return video.getPopularVideast("today", userInfo.id)
    })
    .get('/videast/:id', async ({params: {id}, video, userInfo}) => {
        return video.getPopularVideast(id, userInfo.id)
    }, {
        params: 'id'
    })
