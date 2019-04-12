import React from 'react';
import Menu from '../Menu/Menu';
import Logo from '../Logo/Logo'
import { cn } from '@bem-react/classname';
import './Header.css';

const cnHeader = cn('Header');

function Header(props){
    return (
      <header className={cnHeader()}>
        <Logo className={cnHeader('Item')} />
        <Menu className={cnHeader('Item')} />
      </header>
    );
}

export default Header;