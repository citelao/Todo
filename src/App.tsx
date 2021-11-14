import React from 'react';
import logo from './logo.svg';
import './App.css';
import TodoApp from './model/TodoApp';
import TreeGrid from './view/TreeGrid';

const todo = new TodoApp();

function App() {
  return (
    <div className="App">
      <TreeGrid items={todo.getTodos().map((t) => {
        return {
          id: t.id,
          data: [t.title]
        };
      })} />
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
