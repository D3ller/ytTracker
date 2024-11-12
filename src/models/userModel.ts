import {error, t} from "elysia"
import {PrismaClient} from '@prisma/client'
import {hashPassword, verifyPassword} from "../libs/password.utils";
import {ElysiaCustomStatusResponse} from "elysia/dist/error";

const prisma = new PrismaClient()

export const usr = t.Object({
    id: t.Integer(),
    username: t.String({minLength: 4}),
    password: t.String({minLength: 8})
})

export type User = typeof usr.static;
// export type UserWithoutPassword = Omit<User, 'password'>;

export class Users {

    async getUserByUsername(username: string) {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        });

        return user;
    }

    async getUserById(id: number) {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        });

        return {...user, password: undefined};
    }

    async createUser(username: string, password: string) : Promise<User | ElysiaCustomStatusResponse<any>> {

            const hash = await hashPassword(password);
            const valid = await this.ValidUser(username, password);
            if(valid !== true) return valid;

            return prisma.user.create({
                data: {
                    username: username,
                    password: hash
                }
            });
    }

    async connectUser(username: string, password: string) {

        console.log(username, password);

        const user = await this.getUserByUsername(username);
        if(!user) return error(404, {
            success: false,
            message: 'User not found'
        });

        const verify = await verifyPassword(password, user.password);
        if(!verify) return error(401, {
            success: false,
            message: 'Password incorrect'
        });

        const {password: _, ...userWithoutPassword} = user;

        return {
            success: true,
            message: 'User connected as ' + username,
            user: userWithoutPassword
        }
    }

    async ValidUser(username: string, password: string) {
        if(username.length < 4) return error(400, {
            success: false,
            message: 'Username must be at least 4 characters'
        });

        if(password.length < 8) return error(400, {
            success: false,
            message: 'Password must be at least 8 characters'
        });

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        if(!passwordRegex.test(password)) return error(400, {
            success: false,
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        });

        return true;
    }
}