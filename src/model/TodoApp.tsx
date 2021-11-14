export interface ITodo {
    id: number;
    title: string;
    dueDate?: Date;
    startDate?: Date;

    children?: ITodo[];
}

export default class TodoApp {
    public getTodos(): ITodo[]
    {
        const todos: ITodo[] = [
            { id: 0, title: "Pick up eggs", dueDate: new Date(), children: [
                { id: 1000, title: "Grocery shop", },
                { id: 1001, title: "Grocery shop 2", },
                { id: 1002, title: "Grocery shop 3", },
                { id: 1003, title: "Grocery shop 4", },
            ] },
            { id: 1, title: "Grocery shop", },
            { id: 2, title: "Dance", },
            { id: 3, title: "Fly", },
            { id: 4, title: "dance", },
        ];
        return todos;
    }
}