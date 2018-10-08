/* 


        document.querySelector('main').textContent = userAgent;
        document.querySelector('main').textContent = 'PPPPasdasd';


events json
let dataEvents = getEvents('events.json');

function getEvents(path) {
    let request = new XMLHttpRequest();
    request.open('GET', path, false);
    request.send(null);
    let result = JSON.parse(request.responseText);
    return result;
}  */

/* import React from 'react';

import template from './file.pug';

class Report extends React.Component {
  render() {
    return template;
  }
}; */



    /* } else {
        // document.querySelector('main').textContent = 'noPolY';
        cam.addEventListener('touchstart', setState);
        cam.addEventListener('touchmove', changeBackgroundPosition);
        cam.addEventListener('touchend', stopMove);
        cam.addEventListener('touchcancel', stopMove);
    } */


/* // Log events flag
    var logEvents = false;

    // Logging/debugging functions
    function enableLog(ev) {
    logEvents = logEvents ? false : true;
    }

    function log(prefix, ev) {
        if (!logEvents) return;
        var o = document.getElementsByTagName('output')[0];
        var s = prefix + ": pointerID = " + ev.pointerId +
                        " ; pointerType = " + ev.pointerType +
                        " ; isPrimary = " + ev.isPrimary;
        o.innerHTML += "<div>" + s + "div";
    } 

    function clearLog(event) {
        var o = document.getElementsByTagName('output')[0];
        o.innerHTML = "";
    }

    const start = document.querySelector('#log');
    start.onclick=enableLog;
    const clear = document.querySelector('#clearlog');
    clear.onclick=clearLog;

     */
