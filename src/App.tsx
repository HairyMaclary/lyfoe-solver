import React from 'react';
// import logo from './logo.svg';
// import { Button } from './Button';
// import { Counter } from './counter';
import './App.css';
import { Lyfoe } from './lyfoe/lyfoe';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <Lyfoe />
      </header>
    </div>
  );
}

export default App;
