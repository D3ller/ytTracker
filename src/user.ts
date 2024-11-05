import {Elysia, error, t} from "elysia";
import {usr, Users, User} from "./models/userModel";
import {jwt} from '@elysiajs/jwt'

export const userService = new Elysia({name: 'user/service'})

    .model({
        signIn: t.Object({
            username: t.String({minLength: 1}),
            password: t.String({minLength: 8})
        }),
        session: t.Cookie({
            session: t.String()
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
                    if (!token.value)
                        return error(401, {
                            success: false,
                            message: 'Unauthorized'
                        })


                    const userInfo = jwt.verify(token.value)

                    if (!userInfo)
                        return error(401, {
                            success: false,
                            message: 'Unauthorized'
                        })
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
        cookie: 'session',
    })
    .resolve(
        {as: 'scoped'},
        async ({jwt, cookie: {token}}) => ({
            userInfo: await jwt.verify(token.value)
        })
    )
    .as('plugin')

export const user = new Elysia({prefix: '/auth'})
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
                    httpOnly: true,
                    maxAge: 60 * 60 * 24 * 7
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
                    httpOnly: true,
                    maxAge: 60 * 60 * 24 * 7
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
    .get('/me', async ({cookie: {token}, userInfo, usr, jwt}) => {

        const user = await usr.getUserById(userInfo.id)
        delete user.password;

        token.set({
            value: await jwt.sign(user),
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7
        })


        return {
            success: true,
            user: user
        }
    }, {
        isSignIn: true
    })
    .get('/profile', ({userInfo}) => {
        return {
            success: true,
            userInfo
        };
    }, {isSignIn: true});
