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
    ]
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
      <table>
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th>&nbsp;</th>
            <th>Start date</th>
            <th>Due date</th>
          </tr>
        </thead>
        <tbody>
          {todo.getTodos().map((t) => {
            return <tr key={t.id}>
              <td><input type="checkbox" /></td>
              <td>{t.title}</td>
              <td>{(t.startDate ?? "").toString()}</td>
              <td>{(t.dueDate ?? "").toString()}</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
