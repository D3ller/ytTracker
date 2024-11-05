import {error, t} from "elysia"
import {PrismaClient} from '@prisma/client'
import {Users} from "./userModel";

const prisma = new PrismaClient()

export const video = t.Object({
    id: t.Integer(),
    youtubeId: t.String(),
    userId: t.Integer(),
    createAt: t.Date()
})

export type Video = typeof video.static;

export class Videos {

    async getRecentVideo(User: Object) : Promise<Video[] | any> {

        const user = new Users();
        const userFound = await user.getUserByUsername(User.username);


        return prisma.video.findMany({
            orderBy: {
                createAt: 'desc'
            },
            take: 5,
            where: {
                userId: userFound?.id
            }
        }).then((videos) => {
            if (videos.length === 0) return error(404, {
                success: false,
                message: 'Video not found'
            })

            return videos;
        })


    }

}