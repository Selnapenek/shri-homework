export default function(){

    function classToggle() {
        const nav = document.querySelector('.menu')
        nav.classList.toggle('menu_show');
    }

    document.querySelector('.menu__icon').addEventListener('click', classToggle);
}



