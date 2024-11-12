import {Elysia, error, t} from "elysia";
import {usr, Users} from "../models/userModel";
import {clearToken} from "../libs/token.utils";

export const userService = new Elysia({name: 'user/service'})

    .model({
        signIn: t.Object({
            username: t.String({minLength: 1}),
            password: t.String({minLength: 8})
        }),
        session: t.Cookie({
            token: t.String()
        })
    })
    .model((model) => ({
        ...model,
        optionalSession: t.Optional(model.session)
    }))
    .macro(({onBeforeHandle}) => ({
        isSignIn(enabled: boolean) {
            if (!enabled) return

            onBeforeHandle(
                ({error, cookie: {token}, jwt}) => {
                    console.log(token.value + ' token')
                    if (!token.value) {
                        clearToken(token)
                        return error(401, {
                            success: false,
                            message: 'Unauthorized'
                        })
                    }

                    const userInfo = jwt.verify(token.value)
                    console.log(userInfo)

                    if (!userInfo) {
                        clearToken(token)
                        return error(401, {
                            success: false,
                            message: 'Unauthorized'
                        })
                    }
                }
            )
        },

        isAuth(enabled: boolean) {
            if (!enabled) return

            onBeforeHandle(
                async ({error, cookie: {token}, jwt}) => {

                    const user = await jwt.verify(token.value)


                    if (user) {
                        return error(401, {
                            message: "You are already connected",
                            success: false
                        })
                    }
                }
            )
        }
    }))

export const getUserId = new Elysia()
    .use(userService)
    .guard({
        as: 'scoped',
        isSignIn: true,
        cookie: 'token',
    })
    .resolve(
        {as: 'scoped'},
        async ({jwt, cookie: {token}}) => ({
            userInfo: await jwt.verify(token.value)
        })
    )
    .as('plugin')

export const userController = new Elysia({prefix: '/auth'})
    .decorate('usr', new Users())
    .model({usr: usr})
    .use(userService)
    .put('/register', async ({jwt, usr, cookie: {token}, body: {username, password}, error}) => {

            if (await usr.getUserByUsername(username)) return error(400, {
                success: false,
                message: 'User already exists'
            })

            const user = await usr.createUser(username, password)
            delete user.password

            if (user.success) {

                token.set({
                    value: await jwt.sign(user),
                    httpOnly: false,
                    maxAge: 60 * 60 * 24 * 7,
                    secure: true,
                    sameSite: 'none'
                })

                return {
                    success: true,
                    message: 'User created',
                    user
                }
            }

            return user;
        },
        {
            body: 'signIn',
            isAuth: true,
        })

    .post(
        '/login',
        async ({
                   usr,
                   body: {username, password},
                   jwt,
                   cookie: {token}
               }) => {

            const User = await usr.connectUser(username, password)
            if (User.success) {
                token.set({
                    value: await jwt.sign(User.user),
                    httpOnly: false,
                    secure: true,
                    maxAge: 60 * 60 * 24 * 7,
                    sameSite: 'none'
                })
            }
            return User;
        },
        {
            body: 'signIn',
            cookie: 'optionalSession',
            isAuth: true
        }
    )

    .get('/logout', ({cookie: {token}, jwt}) => {

        const user = jwt.verify(token.value)

        if (!user) {
            return error(401, {
                message: "Your not authorized to read this",
                success: false
            })
        }

        token.remove()

        return {
            success: true,
            message: 'Logout'
        }
    }, {
        cookie: 'optionalSession',
        isSignIn: true,
    })
    .use(getUserId)
    .get('/me', async ({cookie: {token}, jwt, userInfo, usr}) => {

        const user = await usr.getUserById(userInfo.id)
        delete user.password;

        token.set({
            value: await jwt.sign(user),
            httpOnly: false,
            maxAge: 60 * 60 * 24 * 7,
            secure: true,
            sameSite: 'none'
        })

        return {
            success: true,
            user: user
        }
    }, {isSignIn: true, cookie: 'optionalSession'})
    .get('/profile', async ({usr, userInfo, cookie: {token}}) => {
        const user = await usr.getUserByUsername(userInfo.username)
        if(!user) {
            clearToken(token)
            return error(404, {
                success: false,
                message: 'User not found'
            });
        }

        delete user.password;

        return {
            success: true,
            user
        };
    }, {isSignIn: true});
