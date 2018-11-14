import React from 'react';
import { cn } from '@bem-react/classname';
import './Menu.css';

const menuItems  = require('./data.json').menuItems;

const cnMenu = cn('Menu');

function Menu(props){
    return (
      <nav className={cnMenu() + ' ' + props.className}>
      {
        menuItems.map( (item) => {
          return (
            <div className={cnMenu('Item')} key={item.title}>
              <a className={cnMenu('Link',['Link'])} href={item.url}>{item.title}</a>
            </div>
          )
        })
      }
      </nav>
    );
}

export default Menu;