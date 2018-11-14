
import React from 'react';
import { cn } from '@bem-react/classname';
import { withBemMod } from '@bem-react/core';

const cnCard = cn('Card');
const cnIcon = cn('Icon');
const cnTwoLinesText = cn('TwoLinesText');

function Card(props){
    const cardData = props.data;
    return (
        // TODO: type заменить на warning: bool
      <div className={cnCard({size: cardData.size, type: cardData.type})}>
        <div className={cnCard('Row')}>
            <div className={cnCard('Icon')}>
                <div className={cnIcon({data: cardData.icon, type: cardData.type})}>
                </div>
                <div className={cnTwoLinesText()}>
                    <div className={cnCard('Title')}>{cardData.title}</div>
                </div>
            </div>
        </div>
        <div className={cnCard('Row', {bettwen: true})}>
            <div className={cnCard('Source')}>{cardData.source}</div>
            <div className={cnCard('Time')}>{cardData.time}</div>
            {(cardData.description || cardData.data) &&
                    <div className={cnCard('Info')}>
                        {cardData.description &&
                        <div className={cnCard('Description')}>{cardData.description}</div>
                        }
                        {cardData.data && //TODO: CardAdition
                        <div></div>
                        }
                    </div>
            }
        </div>

      </div>
    );
}

export default Card;