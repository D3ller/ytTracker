import {error, t} from "elysia"
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export const channel = t.Object({
    channelID: t.Integer(),
})

export type Channel = typeof channel.static;

export class Channels {

    async isChannel(channelID: string) {
        const regex = new RegExp('^UC[a-zA-Z0-9_-]{22}$');
        const isChannel = regex.test(channelID);
        return isChannel ? 'https://www.youtube.com/channel/' + channelID : 'https://www.youtube.com/@' + encodeURI(channelID);
    }

    async getChannel(channelID: string) {

        const url = await this.isChannel(channelID);
        console.log(url)

        const channel = await prisma.videoInformation.findFirst({
            where: {
                authorUrl: url
            }
        })

        if (!channel) return error(404, {
            success: false,
            message: 'Channel not found'
        });

        let top = await this.getTopVideos(url);
        if (!top) {
            top = [];
        }

        return {author: channel.author, authorURl: channel.authorUrl, topVideos: top};
    }

    async getRecentVideos(channelID: string, userID: string) {

        const url = await this.isChannel(channelID);
        const author = await prisma.videoInformation.findMany({
            where: {
                authorUrl: url
            }
        })

        if (!author || author.length === 0) return error(404, {
            success: false,
            message: 'Channel not found'
        });

        const recentVideos = await prisma.video.findMany({
            where: {
                information: {
                    some: {
                        authorUrl: url
                    }
                },
                userId: userID
            },
            include: {
                information: true
            },
            orderBy: {
                createAt: 'desc'
            },
            take: 100
        })

        if (!recentVideos || recentVideos.length === 0) return error(404, {
            success: false,
            message: 'No videos found'
        });

        return recentVideos
    }

    async getTopVideos(channelID: string) {

        const group = await prisma.video.groupBy({
            by: ['youtubeId'],
            _count: {
                youtubeId: true
            },
            where: {
                information: {
                    some: {
                        authorUrl: channelID
                    }
                }
            },
            orderBy: {
                _count: {
                    youtubeId: 'desc'
                }
            }
        })

        let videos = await prisma.videoInformation.findMany({
            where: {
                authorUrl: channelID,
                videoId: {
                    in: group.map(g => g.youtubeId)
                }
            },
            take: 5,
        });

        if (!videos) return false;

        return videos
            .map(g => {
                let video = group.find(v => v.youtubeId === g.videoId);

                return {
                    information: [{
                        title: g.title ?? 'No title',
                        author: g.author,
                        authorUrl: g.authorUrl,
                        thumbnail: g.thumbnail,
                    }],
                    _count: {
                        youtubeId: parseInt(video._count.youtubeId),
                    },
                    youtubeId: g.videoId,
                }
            })
            .sort((a, b) => b._count.youtubeId - a._count.youtubeId);

    }
}