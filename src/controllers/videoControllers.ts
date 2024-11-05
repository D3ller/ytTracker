import {Elysia, t} from "elysia";
import {video, Videos} from "../models/videoModels";
import {getUserId, userService} from "../user";

export const videoController = new Elysia({prefix: '/videos'})
    .use(userService)
    .decorate('video', new Videos())
    .use(getUserId)
    .get('/', ({userInfo, video}) => {
        return video.getRecentVideo(userInfo)
    }, {
        isSignIn: true
    })
