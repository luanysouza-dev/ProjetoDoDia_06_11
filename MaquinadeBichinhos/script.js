(function () {
    var cv = document.getElementById('game'), ctx = cv.getContext('2d');
    var scoreEl = document.getElementById('score'), btn = document.getElementById('btn');
    ctx.imageSmoothingEnabled = false;

    var W = 160, H = 220, FLOOR = 160, HOME = 20, CHUTE_X = 17;
    var MIN_X = 12, MAX_X = 148, SPEED = 45, DROP_SPEED = 60, RISE_SPEED = 45;

    var TYPES = [
        { k: 'cat', b: '#f4a259', d: '#d9803a' },
        { k: 'bear', b: '#a8683a', d: '#7b4524' },
        { k: 'bunny', b: '#ffffff', d: '#cdd8e6' },
        { k: 'blob', b: '#35c2b0', d: '#1f9a8a' },
        { k: 'ghost', b: '#eaf3ff', d: '#8fbbe8' }
    ];

    var animals = [], score = 0, pressing = false;
    var claw = { x: 80, len: HOME, dir: 1, closed: 0, state: 'idle', held: null, timer: 0, slip: false, startLen: HOME };


    function supportY(a) {
        var y = FLOOR - 16;
        for (var i = 0; i < animals.length; i++) {
            var o = animals[i];
            if (o === a || o.held) continue;
            if (Math.abs(o.x - a.x) < 13 && o.y > a.y + 6) y = Math.min(y, o.y - 13);
        }
        return y;
    }

    function spawn() {
        animals = [];
        var tries = 0;
        while (animals.length < 14 && tries < 300) {
            tries++;
            var a = { x: 44 + Math.random() * 92, y: -100, t: TYPES[animals.length % TYPES.length], vy: 0, falling: false, held: false };
            var y = supportY(a);
            if (y < FLOOR - 16 - 26) continue;
            a.y = y;
            animals.push(a);
        }
    }

    function collect(a) {
        var i = animals.indexOf(a);
        if (i > -1) animals.splice(i, 1);
        score++;
        scoreEl.textContent = score;
        if (!animals.length) setTimeout(spawn, 800);
    }

    function drawAnimal(a) {
        var x = Math.round(a.x), y = Math.round(a.y), c = a.t;
        function R(rx, ry, w, h, col) { ctx.fillStyle = col; ctx.fillRect(x + rx, y + ry, w, h); }
        if (c.k === 'bunny') {
            R(4, 0, 3, 6, c.b); R(9, 0, 3, 6, c.b);
            R(5, 1, 1, 4, '#f7a8c0'); R(10, 1, 1, 4, '#f7a8c0');
        } else if (c.k === 'bear') {
            R(2, 2, 4, 4, c.b); R(10, 2, 4, 4, c.b);
            R(3, 3, 2, 2, c.d); R(11, 3, 2, 2, c.d);
        } else if (c.k === 'blob') {
            R(5, 1, 6, 4, c.b);
        } else {
            var ear = c.k === 'ghost' ? c.d : c.b;
            R(3, 2, 3, 4, ear); R(10, 2, 3, 4, ear);
        }
        R(2, 5, 12, 8, c.b);
        R(3, 13, 10, 3, c.d);
        if (c.k === 'bear') R(6, 10, 4, 3, '#d9b08c');
        R(5, 8, 2, 2, '#222'); R(9, 8, 2, 2, '#222');
        R(7, 10, 2, 1, '#e9788f');
    }

    function dropLimit() {
        var lim = FLOOR;
        for (var i = 0; i < animals.length; i++) {
            var o = animals[i];
            if (o.held) continue;
            if (Math.abs(o.x + 8 - claw.x) < 9) lim = Math.min(lim, o.y + 5);
        }
        return lim;
    }

    function releaseHeld() {
        var h = claw.held;
        if (!h) return;
        h.held = false; h.falling = true; h.vy = 0;
        claw.held = null;
    }

    function update(dt) {
        var c = claw, i;

        var list = animals.slice();
        for (i = 0; i < list.length; i++) {
            var a = list[i];
            if (a.held) continue;
            if (!a.falling && a.y < supportY(a) - 1) { a.falling = true; a.vy = 0; }
            if (a.falling) {
                a.vy += 320 * dt;
                a.y += a.vy * dt;
                if (a.x + 8 < 30) {
                    if (a.y > 190) collect(a);
                } else {
                    var s = supportY(a);
                    if (a.y >= s) { a.y = s; a.falling = false; a.vy = 0; }
                }
            }
        }

        switch (c.state) {
            case 'idle':
                if (pressing) {
                    c.x += c.dir * SPEED * dt;
                    if (c.x > MAX_X) { c.x = MAX_X; c.dir = -1; }
                    if (c.x < MIN_X) { c.x = MIN_X; c.dir = 1; }
                }
                break;

            case 'drop':
                c.len += DROP_SPEED * dt;
                var lim = dropLimit();
                if (c.len + 14 >= lim) { c.len = lim - 14; c.state = 'close'; c.timer = 0; }
                break;

            case 'close':
                c.timer += dt;
                c.closed = Math.min(1, c.timer / 0.5);
                if (c.timer >= 0.5) {
                    var best = null, bk = 1e9, bdx = 0;
                    for (i = 0; i < animals.length; i++) {
                        var o = animals[i];
                        if (o.held) continue;
                        var dx = Math.abs(o.x + 8 - c.x);
                        if (dx <= 9 && c.len + 14 >= o.y + 3) {
                            var k = o.y * 3 + dx;
                            if (k < bk) { bk = k; best = o; bdx = dx; }
                        }
                    }
                    if (best && Math.random() < Math.max(0.35, 0.9 - bdx * 0.04)) {
                        c.held = best; best.held = true; best.falling = false;
                        c.slip = Math.random() < 0.1 + bdx * 0.04;
                    }
                    c.startLen = c.len;
                    c.state = 'rise';
                }
                break;

            case 'rise':
                c.len -= RISE_SPEED * dt;
                if (c.held && c.slip && c.len < (c.startLen + HOME) / 2) {
                    releaseHeld(); c.slip = false;
                }
                if (c.len <= HOME) { c.len = HOME; c.state = 'return'; }
                break;

            case 'return':
                var d = CHUTE_X - c.x, step = SPEED * 1.3 * dt;
                if (Math.abs(d) <= step) {
                    c.x = CHUTE_X; c.state = 'release'; c.timer = 0;
                    releaseHeld();
                } else {
                    c.x += Math.sign(d) * step;
                }
                break;

            case 'release':
                c.timer += dt;
                c.closed = Math.max(0, 1 - c.timer / 0.4);
                if (c.timer > 0.6) { c.closed = 0; c.dir = 1; c.state = 'idle'; }
                break;
        }

        if (c.held) { c.held.x = c.x - 8; c.held.y = c.len + 14 - 5; }
    }


    function drawClaw() {
        var c = claw, x = Math.round(c.x), y = Math.round(c.len);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x, 0, 1, y);
        ctx.fillStyle = '#4b5b6b'; ctx.fillRect(x - 5, y, 11, 5);
        ctx.fillStyle = '#8fa3b5'; ctx.fillRect(x - 5, y, 11, 2);
        var spread = Math.round(8 - 5 * c.closed);
        ctx.fillStyle = '#4b5b6b';
        for (var i = 0; i < 10; i++) {
            var px = Math.round(5 + (spread - 5) * i / 9);
            ctx.fillRect(x + px - 1, y + 5 + i, 2, 1);
            ctx.fillRect(x - px - 1, y + 5 + i, 2, 1);
        }
        ctx.fillRect(x + spread - 3, y + 14, 3, 1);
        ctx.fillRect(x - spread, y + 14, 3, 1);
    }

    function draw() {
        ctx.fillStyle = '#9fe3ea'; ctx.fillRect(0, 0, W, 56);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(80, 0, 1, 56); ctx.fillRect(0, 28, W, 1);
        ctx.fillStyle = '#6b3f23'; ctx.fillRect(0, 56, W, 6);
        ctx.fillStyle = '#d8f4f4'; ctx.fillRect(0, 62, W, 98);
        ctx.fillStyle = '#3b7fae'; ctx.fillRect(0, 160, W, 52);
        ctx.fillStyle = '#6b3f23'; ctx.fillRect(0, 160, W, 3); ctx.fillRect(0, 212, W, 8);

        for (var i = 0; i < animals.length; i++) drawAnimal(animals[i]);

        // saída dos bichinhos (esconde quem cai)
        ctx.fillStyle = '#2c6f9e'; ctx.fillRect(0, 120, 34, 92);
        ctx.fillStyle = '#3c86b8'; ctx.fillRect(0, 120, 34, 3);
        ctx.fillStyle = '#ffffff';
        for (var r = 0; r < 5; r++) ctx.fillRect(14 + r, 134 + r, 7 - 2 * r, 1);

        ctx.fillStyle = pressing ? '#ffd54a' : '#2a3a44';
        ctx.beginPath(); ctx.arc(136, 186, 9, 0, 6.283); ctx.fill();
        ctx.fillStyle = '#cfd8dc';
        ctx.beginPath(); ctx.arc(136, 186, 9, 0, 6.283); ctx.lineWidth = 1.5; ctx.strokeStyle = '#cfd8dc'; ctx.stroke();

        drawClaw();
    }

    function press() {
        if (claw.state === 'idle') { pressing = true; btn.classList.add('down'); }
    }
    function release() {
        if (!pressing) return;
        pressing = false; btn.classList.remove('down');
        if (claw.state === 'idle') { claw.closed = 0; claw.state = 'drop'; }
    }
    btn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        try { btn.setPointerCapture(e.pointerId); } catch (err) { }
        press();
    });
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    window.addEventListener('keydown', function (e) {
        if ((e.code === 'Space' || e.code === 'ArrowRight') && !e.repeat) { e.preventDefault(); press(); }
    });
    window.addEventListener('keyup', function (e) {
        if (e.code === 'Space' || e.code === 'ArrowRight') release();
    });


    var last = performance.now();
    function loop(now) {
        var dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        update(dt);
        draw();
        requestAnimationFrame(loop);
    }
    spawn();
    requestAnimationFrame(loop);
})();