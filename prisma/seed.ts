import {PrismaClient} from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.upsert({
        where: { username: 'demouser' },
        update: {},
        create: {
            username: 'demouser',
            password: '$argon2id$v=19$m=65536,t=2,p=1$Jw9cYeMP5CSWrkK4eq+8csl490pwhUFQ+Qhlvc4s84M$tMhXehBpaeDUdC1g7afxC4JQK65w5rlKma6KH2pZc4Q',
        },
    })

    console.log({ user })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })