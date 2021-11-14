interface ITodo {
    id: number;
    title: string;
    dueDate?: Date;
    startDate?: Date;
}

export default class TodoApp {
    public getTodos(): ITodo[]
    {
        const todos: ITodo[] = [
            { id: 0, title: "Pick up eggs", dueDate: new Date() },
            { id: 1, title: "Grocery shop", },
            { id: 2, title: "Dance", },
            { id: 3, title: "Fly", },
        ];
        return todos;
    }
}