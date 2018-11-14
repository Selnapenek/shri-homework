import React from 'react';
import { cn } from '@bem-react/classname';

const cnLogo = cn('Logo');

function Logo(props){
    return (
      <a href="#" className={props.className}>
        <div className={cnLogo()}>
        
        </div>
      </a>
    );
}

export default Logo;