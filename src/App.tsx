import React from 'react';
import logo from './logo.svg';
import './App.css';

const todos = [
  { id: 0, title: "Pick up eggs", },
  { id: 1, title: "Grocery shop", },
  { id: 2, title: "Dance", },
  { id: 3, title: "Fly", },
];

function App() {
  return (
    <div className="App">
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
          {todos.map((t) => {
            return <tr key={t.id}>
              <td><input type="checkbox" /></td>
              <td>{t.title}</td>
              <td>&nbsp;</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
