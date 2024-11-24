import {Elysia, t} from "elysia";
import {getUserId, userService} from "./userController";
import {Channels} from "../models/channelModel";

export const channelController = new Elysia({prefix: '/channel'})
    .use(userService)
    .decorate('channel', new Channels())
    .get('/', async ({query: {channelID}, channel}) => {
        return channel.getChannel(channelID)
    }, {
        query: t.Object({
            channelID: t.String()
        })
    })
    .use(getUserId)
    .get('/recent/:id', async ({params: {id}, channel, userInfo}) => {
        return channel.getRecentVideos(id, userInfo.id)
    }, {
        params: t.Object({
            id: t.String()
        })
    })
