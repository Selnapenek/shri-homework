import React from 'react';
import { cn } from '@bem-react/classname';
import './Footer.css';

const footerItems  = require('./data.json').footerItems;

const cnFooter = cn('Footer');


function Footer(props){
    return (
      <footer className={cnFooter()}>
        <div className={cnFooter('Left')}>
        {
          footerItems.map((item) => {
            return (
              <div className={cnFooter('Item')} key={item.title}>
                <a className="Link" href={item.url}>{item.title}</a>
              </div>
            )
          })
        }
        </div>
        <div className={cnFooter('Right')}>
          <div className={cnFooter('Item')}>
            © 2001–2017  ООО «Яндекс»
          </div>
        </div>
      </footer>
    );
}

export default Footer;