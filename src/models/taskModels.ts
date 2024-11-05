import {error, t} from "elysia"

export const task = t.Object({
    id: t.Integer(),
    title: t.String(),
    status: t.Boolean()
})

export type Task = typeof task.static;

export class TaskModels {
    constructor(public task: Task[] = [{id: 1, title: 'Coucou', status: false}]) {

    }

    getAllTask() {
        return this.task
    }

    getTaskByID(index: number) {
        let find = this.task.find((i) => i.id == index);
        if(!find) return error(404, "This task doesn't exist");
        return find;
    }

    addTask(title: string) {
        this.task.push({id: this.task.length + 1, title: title, status: false});
        return this.task[this.task.length - 1]
    }

    updateTask(id: number, title: string, completed?: boolean) {
        let find = this.task.find((i) => i.id == id);
        if(!find) return error(404, "This task doesn't exist");

        if(find.status) {
            return error(401, "You can't update a completed task")
        }

        find.title = title;
        if(completed){
            find.status = true
        }
        return find;

    }

    deleteTask(id: number) {
        let find = this.task.find((i) => i.id == id);
        let index = this.task.findIndex((i) => i.id === id);
        if(index > -1) {
            this.task.splice(index, 1);
            return {message: "Task deleted", success: true}
        }
        if(!find) return error(404, "This task doesn't exist");
    }
}