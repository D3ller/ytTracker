import { Elysia, t } from 'elysia'
import { getUserId, userService } from '../userController'
import {memo, Note} from "../models/noteModels";

export const noteController = new Elysia({ prefix: '/note' })
    .use(userService)
    .decorate('note', new Note())
    .model({
        memo: t.Omit(memo, ['author'])
    })
    .onTransform(function log({ body, params, path, request: { method } }) {
        console.log(`${method} ${path}`, {
            body,
            params
        })
    })
    .get('/', ({ note }) => note.data)
    .use(getUserId)
    .get('/me', ({ note, username }) => note.getByAuthor(username))
    .put(
        '/',
        ({ note, body: { data }, username }) =>
            note.add({ data, author: username }),
        {
            body: 'memo'
        }
    )
    .get(
        '/:index',
        ({ note, params: { index }, error }) => {
            return note.data[index] ?? error(404, 'Not Found :(')
        },
        {
            params: t.Object({
                index: t.Number()
            })
        }
    )
    .guard({
        params: t.Object({
            index: t.Number()
        })
    })
    .delete('/:index', ({ note, params: { index }, error }) => {
        if (index in note.data) return note.remove(index)
        return error(422)
    })
    .patch(
        '/:index',
        ({ note, params: { index }, body: { data }, error, username }) => {
            if (index in note.data)
                return note.update(index, { data, author: username })
            return error(422)
        },
        {
            isSignIn: true,
            body: 'memo'
        }
    )
