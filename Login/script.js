(function () {
    var body = document.body, tg = document.getElementById('tg'), card = document.getElementById('card');
    var fields = card.querySelectorAll('input,button,a'), msg = document.getElementById('msg');
    function set(on) {
        body.classList.toggle('on', on);
        tg.setAttribute('aria-checked', on);
        tg.setAttribute('aria-label', on ? 'Apagar as luzes da casa' : 'Acender as luzes da casa');
        card.setAttribute('aria-hidden', !on);
        fields.forEach(function (f) { f.tabIndex = on ? 0 : -1 });
        if (!on) msg.textContent = '';
    }
    tg.addEventListener('click', function () { set(!body.classList.contains('on')) });
    card.addEventListener('submit', function (e) {
        e.preventDefault();
        var u = document.getElementById('u').value.trim(), p = document.getElementById('p').value;
        msg.textContent = (u && p) ? 'Bem-vindo de volta, ' + u + '!' : 'Preencha usuário e senha.';
    });
})();