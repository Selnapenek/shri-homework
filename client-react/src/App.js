import React, { Component } from 'react';
import { cn } from '@bem-react/classname';
import { withBemMod } from '@bem-react/core';
import logo from './logo.svg';
import './App.css';
import Events from './Events/Events';
import Header from './Header/Header';
import Footer from './Footer/Footer';

class App extends Component {
  render() {
    const cnPage = cn('Page');

    return (
      <div className={cnPage()}>
        <Header />

        <Events />

        <Footer />

      </div>
    );
  }
}

export default App;
