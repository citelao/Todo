import React from 'react';
import logo from './logo.svg';
import './App.css';
import TodoApp, { ITodo } from './model/TodoApp';
import TreeGrid, { IItem } from './view/TreeGrid';

const todo = new TodoApp();

function renderItem(todo: ITodo): IItem {
  return {
    id: todo.id,
    data: [
      <input type="checkbox" tabIndex={-1} />,
      todo.title,
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
