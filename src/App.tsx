import React from 'react';
import logo from './logo.svg';
import './App.css';
import TodoApp, { ITodo } from './model/TodoApp';
import TreeGrid, { IItem } from './view/TreeGrid';

const todo = new TodoApp();

interface ITodoTextProperties {
    text: string;
}

interface ITodoTextState {
    isEditing: boolean;
}

class TodoText extends React.Component<ITodoTextProperties, ITodoTextState> {
    public constructor(props: ITodoTextProperties) {
        super(props);
        this.state = {
            isEditing: true
        };
    }

    public render() {
        // if (this.state.isEditing) {
            return <input type="text" value={this.props.text} onBlur={ () => { this.setState({ isEditing: false }) }} />
        // }

        // return (
        //     <span onDoubleClick={() => { this.setState({ isEditing: true }) }}>
        //         {this.props.text}
        //     </span>
        // );
    }
}

function renderItem(todo: ITodo): IItem {
    return {
        id: todo.id,
        data: [
            <input type="checkbox" tabIndex={-1} />,
            <TodoText text={todo.title} />,
            "start",
            "due",
        ],
        children: todo.children?.map(renderItem)
    }
}

function App() {
    return (
        <div className="App">
        <TreeGrid
        items={todo.getTodos()}
        renderItem={renderItem}
        headers={["", "", "Start date", "Due date"]}
        />
        </div>
        );
    }
    
    export default App;
    