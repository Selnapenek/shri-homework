import React, { Component } from 'react';
import { cn } from '@bem-react/classname';
import { withBemMod } from '@bem-react/core';
import Card from '../Card/Card.js';
import './Events.css';
const cards  = require('./data.json').events

const cnEvents = cn('Events');
const cnContainer = cn('Container');

function Events(props){
    return (
        <div className={cnEvents()}>
          <div className={cnEvents('Title')}>
              <h1>Лента событий</h1>
          </div>
        <div className={cnContainer({'type': 'card'})}>
          {
            cards.map(card => {
              return <Card data={card} key={card.title}/>;
            })
          }
        </div>
        </div>
    );
}

export default Events;