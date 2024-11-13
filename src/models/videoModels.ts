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
export type TimeRange = 'today' | 'weekly' | 'monthly' | 'fweeks' | 'smonth' | '2025' | 'all';
const validTimeRanges: TimeRange[] = ['today', 'weekly', 'monthly', 'fweeks', 'smonth', '2025', 'all'];

export class Videos {

    async getRecentVideo(id: number): Promise<Video[] | any> {

        if (!id) {
            return error(401, {
                success: false,
                message: 'Unauthorized2'
            })
        }

        const user = new Users();
        const userFound = await user.getUserById(id);
        if (!userFound) {
            return error(404, {
                success: false,
                message: 'User not found'
            })
        }


        return prisma.video.findMany({
            orderBy: {
                createAt: 'desc'
            },
            take: 5,
            where: {
                userId: userFound.id
            },
            select: {
                youtubeId: true,
                createAt: true,
                information: {
                    select: {
                        title: true,
                        thumbnail: true,
                        author: true
                    }
                }
            }
        }).then((videos) => {
            if (videos.length === 0) return error(404, {
                success: false,
                message: 'Video not found'
            })

            return videos;
        })


    }

    async addVideo(userId: number, videoId: string) {

        if (!userId) {
            return error(401, {
                success: false,
                message: 'Unauthorized2'
            })
        }

        const user = new Users();
        const userFound = await user.getUserById(userId);
        if (!userFound) {
            return error(404, {
                success: false,
                message: 'User not found'
            })
        }

        try {
            const video = await this.getVideoById(videoId);
            if (!video || video.information.length === 0) {
                const info = await this.getVideoInfo(videoId);
                if (!info) {
                    error(404, {
                        success: false,
                        message: 'Video not found'
                    })
                }

                const information = await prisma.videoInformation.create({
                    data: {
                        title: info?.title,
                        thumbnail: info?.thumbnail,
                        author: info?.author,
                        authorUrl: info?.authorUrl,
                        videoId: videoId
                    }
                })

                await prisma.video.create({
                    data: {
                        youtubeId: videoId,
                        userId: userId,
                        information: {
                            connect: [{id: information.id}]
                        }
                    }
                })

                console.log(info?.title + ' added to your history')

                return {success: true, message: "Music added to your history", information}
            }

            console.log(video.information[0].title + ' added to your history')

            await prisma.video.create({
                data: {
                    youtubeId: videoId,
                    userId: userId,
                    information: {
                        connect: [{id: video.information[0].id}]
                    }
                },
            })

        } catch (e: unknown) {
            return error(404, {
                success: false,
                message: e?.message
            })
        }


    }

    async getVideoById(videoId: string) {
        return prisma.video.findFirst({
            where: {
                youtubeId: videoId
            },
            include: {
                information: true
            }
        }).then((video) => {
            if (!video) return null
            return video;
        })
    }

    async getVideoInfo(videoId: string) {
        try {
            const response = await fetch('https://noembed.com/embed?url=https://www.youtube.com/watch?v=' + videoId);
            const info = await response.json();

            if (info.error) {
                return null;
            }

            return {
                title: info.title,
                thumbnail: info.thumbnail_url,
                author: info.author_name,
                authorUrl: info.author_url,
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des informations vidéo :', error);
            return null;
        }
    }

    async getStats(timeslot: TimeRange, userId: number) {
        if (!validTimeRanges.includes(timeslot)) {
            return error(400, {
                success: false,
                message: 'Invalid time range'
            });
        }

        if (!userId) {
            return error(401, {
                success: false,
                message: 'Unauthorized'
            })
        }

        const user = new Users();
        const userFound = await user.getUserById(userId);
        if (!userFound) {
            return error(404, {
                success: false,
                message: 'User not found'
            })
        }

        const date = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (timeslot) {
            case 'today':
                startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                break;
            case 'weekly':
                startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
                endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7 - date.getDay());
                break;
            case 'monthly':
                startDate = new Date(date.getFullYear(), date.getMonth(), 1);
                endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                break;
            case 'fweeks':
                startDate = new Date(date.getFullYear(), date.getMonth(), 1);
                endDate = new Date(date.getFullYear(), date.getMonth(), 15);
                break;
            case 'smonth':
                startDate = new Date(date.getFullYear(), date.getMonth(), 16);
                endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                break;
            case '2025':
                startDate = new Date(2025, 0, 1);
                endDate = new Date(2026, 0, 1);
                break;
            case 'all':
                startDate = new Date(0);
                endDate = new Date(8640000000000000);
                break;
            default:
                return error(400, {
                    success: false,
                    message: 'Invalid time range'
                });
        }

        const groupedVideos = await prisma.video.groupBy({
            by: ['youtubeId'],
            where: {
                userId: userFound.id,
                createAt: {
                    gte: startDate,
                    lt: endDate
                },
            },
            _count: {
                youtubeId: true
            },
            orderBy: {
                _count: {
                    youtubeId: 'desc'
                }
            }
        });


        const detailedVideos = await prisma.video.findMany({
            where: {
                youtubeId: { in: groupedVideos.map(g => g.youtubeId) },
                userId: userFound.id,
            },
            select: {
                youtubeId: true,
                information: {
                    select: {
                        title: true,
                        thumbnail: true,
                        author: true,
                        authorUrl: true
                    }
                }
            }
        });

        const finalResult = groupedVideos.map(group => {
            const details = detailedVideos.find(video => video.youtubeId === group.youtubeId);
            return {
                ...group,
                information: details?.information
            };
        });

        return finalResult;


    }

    async getStatsByUsername(timeslot: TimeRange, username: string) {
        if (!validTimeRanges.includes(timeslot)) {
            return error(400, {
                success: false,
                message: 'Invalid time range'
            });
        }

        const user = new Users();
        const userFound = await user.getUserByUsername(username);
        if (!userFound) {
            return error(404, {
                success: false,
                message: 'User not found'
            })
        }

        const date = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (timeslot) {
            case 'today':
                startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                break;
            case 'weekly':
                startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
                endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7 - date.getDay());
                break;
            case 'monthly':
                startDate = new Date(date.getFullYear(), date.getMonth(), 1);
                endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                break;
            case 'fweeks':
                startDate = new Date(date.getFullYear(), date.getMonth(), 1);
                endDate = new Date(date.getFullYear(), date.getMonth(), 15);
                break;
            case 'smonth':
                startDate = new Date(date.getFullYear(), date.getMonth(), 16);
                endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                break;
            case '2025':
                startDate = new Date(2025, 0, 1);
                endDate = new Date(2026, 0, 1);
                break;
            case 'all':
                startDate = new Date(0);
                endDate = new Date(8640000000000000);
                break;
            default:
                return error(400, {
                    success: false,
                    message: 'Invalid time range'
                });
        }

        const groupedVideos = await prisma.video.groupBy({
            by: ['youtubeId'],
            where: {
                userId: userFound.id,
                createAt: {
                    gte: startDate,
                    lt: endDate
                },
            },
            _count: {
                youtubeId: true
            },
            orderBy: {
                _count: {
                    youtubeId: 'desc'
                }
            }
        });

        const detailedVideos = await prisma.video.findMany({
            where: {
                youtubeId: { in: groupedVideos.map(g => g.youtubeId) },
                userId: userFound.id,
            },
            select: {
                youtubeId: true,
                information: {
                    select: {
                        title: true,
                        thumbnail: true,
                        author: true,
                        authorUrl: true
                    }
                }
            }
        });

        const finalResult = groupedVideos.map(group => {
            const details = detailedVideos.find(video => video.youtubeId === group.youtubeId);
            return {
                ...group,
                information: details?.information
            };
        });

        return finalResult;


    }
}