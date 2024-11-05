import {t} from "elysia";

export const memo = t.Object({
    data: t.String(),
    author: t.String()
})

export type Memo = typeof memo.static


export class Note {
    constructor(
        public data: Memo[] = [
            {
                data: 'Moonhalo',
                author: 'saltyaom'
            }
        ]
    ) {}

    add(note: Memo) {
        this.data.push(note)
        return this.data
    }

    remove(index: number) {
        return this.data.splice(index, 1)
    }

    update(index: number, note: Partial<Memo>) {
        return (this.data[index] = { ...this.data[index], ...note })
    }

    getByAuthor(author: string) {
        return this.data.filter(note => note.author === author)
    }
}