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
export type TimeRange = 'hourly' | 'today' | 'weekly' | 'monthly' | 'fweeks' | 'smonth' | '2024' | 'all';
const validTimeRanges: TimeRange[] = ['hourly', 'today', 'weekly', 'monthly', 'fweeks', 'smonth', '2024', 'all'];

export class Videos {

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

    async getTimeRangeDates(timeslot: TimeRange): { startDate: Date; endDate: Date } {
        const date = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (timeslot) {
            case 'hourly':
                startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
                endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1);
                break;
            case 'today':
                startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                break;
            case 'weekly':
                startDate = new Date(date);
                startDate.setDate(date.getDate() - date.getDay() - 6);
                endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                break;
            case 'monthly':
                startDate = new Date(date.getFullYear(), date.getMonth(), 1);
                endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                break;
            case 'fweeks':
                startDate = new Date(date);
                startDate.setDate(startDate.getDate() - 35);
                endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                break;
            case 'smonth':
                startDate = new Date(date.getFullYear(), date.getMonth() - 6, 16);
                endDate = new Date(date.getFullYear(), date.getMonth() + 6, 1);
                break;
            case '2024':
                startDate = new Date(2024, 0, 1);
                endDate = new Date(2025, 0, 1);
                break;
            case 'all':
                const currentDate = new Date();
                startDate = new Date(currentDate.getFullYear() - 5, currentDate.getMonth(), currentDate.getDate());
                endDate = currentDate;
                break;
            default:
                throw new Error('Invalid time range');
        }

        return {startDate, endDate};
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

    // async getStats(timeslot: TimeRange, userId: number) {
    //     if (!validTimeRanges.includes(timeslot)) {
    //         return error(400, {
    //             success: false,
    //             message: 'Invalid time range'
    //         });
    //     }
    //
    //     if (!userId) {
    //         return error(401, {
    //             success: false,
    //             message: 'Unauthorized'
    //         })
    //     }
    //
    //     const user = new Users();
    //     const userFound = await user.getUserById(userId);
    //     if (!userFound) {
    //         return error(404, {
    //             success: false,
    //             message: 'User not found'
    //         })
    //     }
    //
    //     const {startDate, endDate} = this.getTimeRangeDates(timeslot);
    //
    //     const groupedVideos = await prisma.video.groupBy({
    //         by: ['youtubeId'],
    //         where: {
    //             userId: userFound.id,
    //             createAt: {
    //                 gte: startDate,
    //                 lt: endDate
    //             },
    //         },
    //         _count: {
    //             youtubeId: true
    //         },
    //         orderBy: {
    //             _count: {
    //                 youtubeId: 'desc'
    //             }
    //         }
    //     });
    //
    //
    //     const detailedVideos = await prisma.video.findMany({
    //         where: {
    //             youtubeId: {in: groupedVideos.map(g => g.youtubeId)},
    //             userId: userFound.id,
    //         },
    //         select: {
    //             youtubeId: true,
    //             information: {
    //                 select: {
    //                     title: true,
    //                     thumbnail: true,
    //                     author: true,
    //                     authorUrl: true
    //                 }
    //             }
    //         }
    //     });
    //
    //     const finalResult = groupedVideos.map(group => {
    //         const details = detailedVideos.find(video => video.youtubeId === group.youtubeId);
    //         return {
    //             ...group,
    //             information: details?.information
    //         };
    //     });
    //
    //     return finalResult;
    //
    //
    // }

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

        const {startDate, endDate} = await this.getTimeRangeDates(timeslot);

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
                youtubeId: {in: groupedVideos.map(g => g.youtubeId)},
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
            },
            take: 100
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

    async getRecentVideos(id: string) {

        const user = new Users();
        const userFound = await user.getUserById(parseInt(id));
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
            take: 10,
            where: {
                userId: parseInt(id),
            },
            select: {
                youtubeId: true,
                createAt: true,
                information: {
                    select: {
                        title: true,
                        thumbnail: true,
                        author: true,
                        authorUrl: true
                    },
                }
            }
        })
    }

    async getPopularVideos(timeslot: TimeRange, userid: string) {

        if (!validTimeRanges.includes(timeslot)) {
            return error(400, {
                success: false,
                message: 'Invalid time range'
            });
        }

        console.log(timeslot, userid)


        const user = new Users();
        const userFound = await user.getUserById(parseInt(userid));
        if (!userFound) {
            return error(404, {
                success: false,
                message: 'User not found'
            })
        }

        const {startDate, endDate} = await this.getTimeRangeDates(timeslot);

        let group = await prisma.video.groupBy({
            by: ['youtubeId'],
            where: {
                userId: userFound.id,
                createAt: {
                    gte: startDate,
                    lt: endDate
                }
            },
            _count: {
                youtubeId: true
            },
            orderBy: {
                _count: {
                    youtubeId: 'desc'
                }
            },
            take: 100
        });


        let detailedVideos = await prisma.video.findMany({
            where: {
                youtubeId: {in: group.map(g => g.youtubeId)},
                userId: userFound.id
            },
            select: {
                youtubeId: true,
                createAt: true,
                information: {
                    select: {
                        title: true,
                        thumbnail: true,
                        author: true,
                        authorUrl: true
                    }
                }
            },
        })

        // console.log(group.length, detailedVideos.length)

        const result = group.map(g => {
            let v = detailedVideos.find(v => v.youtubeId === g.youtubeId);
            return {g, v}
        });


        const videosWithoutInfo = await prisma.video.findMany({
            where: {
                information: {
                    none: {} // Renvoie les vidéos sans information associée
                },
                youtubeId: { in: group.map(g => g.youtubeId) }
            }
        });

        console.log(videosWithoutInfo)

        const formattedResult = result.map(item => {
            // console.log(item)
            // fetch('https://ntfy.sh/archivecorefr', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({result})
            // })
            return {
                youtubeId: item.g.youtubeId,
                information: item.v.information,
                _count: {
                    youtubeId: item.g._count.youtubeId,
                }
            };
        });

        return formattedResult.slice(0, 100);
    }

    async getPopularVideast(timeslot: TimeRange, userid: string) {

        if (!validTimeRanges.includes(timeslot)) {
            return error(400, {
                success: false,
                message: 'Invalid time range'
            });
        }

        const user = new Users();
        const userFound = await user.getUserById(parseInt(userid));
        if (!userFound) {
            return error(404, {
                success: false,
                message: 'User not found'
            })
        }

        const {startDate, endDate} = await this.getTimeRangeDates(timeslot);

        let group = await prisma.video.groupBy({
            by: ['youtubeId'],
            where: {
                userId: userFound.id,
                createAt: {
                    gte: startDate,
                    lt: endDate
                }
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

        let groupVideast = await prisma.videoInformation.groupBy({
            by: ['authorUrl'],
            where: {
                videoId: {in: group.map(g => g.youtubeId)}
            },
            _count: {
                authorUrl: true
            },
        })

        let information = await prisma.videoInformation.findMany({
            where: {
                authorUrl: {in: groupVideast.map(g => g.authorUrl)}
            },
            select: {
                author: true,
                authorUrl: true
            },
            take: 100
        })


        let finalResult = groupVideast.map(group => {
            let details = information.find(video => video.authorUrl === group.authorUrl);
            return {
                ...group,
                information: details
            }
        })

        return finalResult.sort((a, b) => b._count.authorUrl - a._count.authorUrl).slice(0, 100);
    }

    async getInfo(id: string) {

        console.log(id)

        return prisma.video.findMany({
            where: {
                youtubeId: id
            },
            include: {
                information: true
            }
        });
    }

    async getNull() {
        return prisma.video.findMany({
            where: {
                information: {
                    none: {}
                }
            }
        })
    }

}