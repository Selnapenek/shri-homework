export default function () {

    function classToggle() {
        const nav = document.querySelector( '.menu' );
        nav.classList.toggle( 'menu_show' );
    }

    document.querySelector('.menu__icon').addEventListener('click', classToggle );

    // TODO: Отрисовка ленты с помощью шаблонизатора
    /* let request = new XMLHttpRequest();
    request.open('GET', 'events.json', false);
    request.send(null);
    let result = JSON.parse(request.responseText);
    let eventsJSON = {
    };
    eventsJSON.main = result;
    console.log(eventsJSON); */
}





