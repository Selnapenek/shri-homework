import React from 'react';
import { cn } from '@bem-react/classname';
import Icon from '../Icon/Icon';
import './Logo.css';

const cnLogo = cn('Logo');

function Logo(props){
    return (
      <a href="#" className={props.className}>
        <div className={cnLogo()}>
          <Icon type="logo"/>
        </div>
      </a>
    );
}

export default Logo;