import {Elysia, t} from "elysia";
import {userService} from "../userController";
import {task, TaskModels} from "../models/taskModels";

export const taskController = new Elysia({prefix: '/tasks'})
    .use(userService)
    .decorate('task', new TaskModels())
    .model({task: task})
    .get('/', ({task}) => task.getAllTask())
    .get('/:id', ({task, params: {id}, error}) => {
            return task.getTaskByID(id)
        },
        {
            params: t.Object({
                id: t.Number()
            })
        })
    .put('/', ({task, body: {title}}) => {
        return task.addTask(title)
    }, {
        body: t.Object({
            title: t.String({minLength: 4})
        })
    })
    .patch('/:id', ({task, params: {id}, body: {title, completed}, error}) => {
        return task.updateTask(id, title, completed)
    }, {
        params: t.Object({
            id: t.Number()
        }),
        body: t.Object({
            title: t.String({minLength: 4}),
            completed: t.Optional(t.Boolean())
        })
    })
    .delete('/:id', ({task, params: {id}}) => {
        return task.deleteTask(id)
    }, {
        params: t.Object({
            id: t.Number()
        })
    })