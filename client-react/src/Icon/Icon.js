import React from 'react';
import { cn } from '@bem-react/classname';
import './Icon.css';
const cnIcon = cn('Icon');

function Icon(props){
    return (
        <div className={cnIcon({type: props.type})}>
        </div>
    );
}

export default Icon;