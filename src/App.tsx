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
      <ul>
        {todos.map((t) => {
          return <li key={t.id}>{t.title}</li>;
        })}
      </ul>
    </div>
  );
}

export default App;
