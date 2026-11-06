const D = ["Hayao Miyazaki", "Isao Takahata", "Yoshifumi Kondō", "Tomomi Mochizuki", "Hiroyuki Morita", "Gorō Miyazaki", "Hiromasa Yonebayashi", "Michaël Dudok de Wit"];
const GN = { A: "Aventura", F: "Fantasia", D: "Drama", Fa: "Família", R: "Romance", G: "Guerra", C: "Comédia", H: "História" };
const F = [
    ["Nausicaä do Vale do Vento", 1984, 150, 0, 117, "A F", "Uma princesa corajosa tenta salvar seu povo e a floresta tóxica cheia de insetos gigantes."],
    ["O Castelo no Céu", 1986, 210, 0, 124, "A F", "Dois jovens procuram a lendária ilha flutuante de Laputa."],
    ["O Túmulo dos Vagalumes", 1988, 60, 1, 89, "D G", "Dois irmãos tentam sobreviver ao fim da Segunda Guerra Mundial."],
    ["Meu Amigo Totoro", 1988, 130, 0, 86, "F Fa", "Duas irmãs fazem amizade com espíritos gentis da floresta."],
    ["O Serviço de Entregas da Kiki", 1989, 350, 0, 102, "F Fa", "Uma jovem bruxa começa a vida sozinha numa cidade à beira-mar."],
    ["Memórias de Ontem", 1991, 45, 1, 118, "D R", "Taeko revisita a infância durante uma viagem ao campo."],
    ["Porco Rosso", 1992, 10, 0, 94, "A C", "Um piloto amaldiçoado, em forma de porco, voa pelo Adriático."],
    ["Eu Posso Ouvir o Oceano", 1993, 190, 3, 72, "D R", "Um triângulo amoroso adolescente numa cidade litorânea do Japão."],
    ["Pom Poko", 1994, 30, 1, 119, "F C", "Tanukis mágicos lutam para proteger a floresta da construção de uma cidade."],
    ["Sussurros do Coração", 1995, 280, 2, 111, "R D", "Uma menina que ama livros descobre um gato misterioso e um sonho."],
    ["Princesa Mononoke", 1997, 120, 0, 134, "A F", "Um príncipe amaldiçoado é pego na guerra entre humanos e deuses da floresta."],
    ["Meus Vizinhos os Yamada", 1999, 20, 1, 104, "C Fa", "Cenas engraçadas e doces do dia a dia de uma família japonesa."],
    ["A Viagem de Chihiro", 2001, 350, 0, 125, "A F Fa", "Chihiro, de 10 anos, entra num mundo de espíritos e trabalha numa casa de banhos para libertar seus pais."],
    ["O Reino dos Gatos", 2002, 40, 4, 75, "F A", "Haru salva um gato e é convidada a viver no reino felino."],
    ["O Castelo Animado", 2004, 320, 0, 119, "F R", "Uma garota é transformada em idosa e encontra o mago Howl."],
    ["Contos de Terramar", 2006, 200, 5, 115, "A F", "Um príncipe fugitivo e uma feiticeira num mundo em desequilíbrio."],
    ["Ponyo", 2008, 10, 0, 101, "F Fa", "Um peixinho quer virar menina para ficar com seu melhor amigo."],
    ["O Mundo dos Pequeninos", 2010, 100, 6, 94, "F A", "Arrietty, uma pessoinha de dez centímetros, faz amizade com um garoto."],
    ["A Colina das Papoulas", 2011, 340, 5, 91, "R D", "Estudantes tentam salvar o velho clube escolar em Yokohama, nos anos 60."],
    ["Vidas ao Vento", 2013, 195, 0, 126, "D H", "A história de Jiro, que sonha em projetar aviões."],
    ["O Conto da Princesa Kaguya", 2013, 335, 1, 137, "F D", "Uma princesa nascida de um bambu busca sua felicidade."],
    ["As Memórias de Marnie", 2014, 230, 6, 103, "D F", "Anna encontra uma garota misteriosa numa casa abandonada à beira do lago."],
    ["A Tartaruga Vermelha", 2016, 25, 7, 80, "D F", "Um náufrago numa ilha deserta, sem palavras e cheio de poesia."],
    ["Aya e a Bruxa", 2020, 290, 5, 82, "F Fa", "Uma menina esperta vive com uma bruxa e um gato falante."],
    ["O Menino e a Garça", 2023, 215, 0, 124, "F A", "Mahito entra num mundo fantástico para procurar a mãe."]
];
const N = F.length, $ = id => document.getElementById(id);
const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d } catch (e) { return d } };
const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } };
let seen = new Set(ld("gh-seen", [])), rate = ld("gh-rate", {}), txt = ld("gh-txt", {}), cur = 0, view = 0, IM = {}, db = null;

function idb() { return new Promise(r => { try { const q = indexedDB.open("ghibli", 1); q.onupgradeneeded = () => q.result.createObjectStore("i"); q.onsuccess = () => { db = q.result; r() }; q.onerror = () => r() } catch (e) { r() } }) }
function idbAll() { return new Promise(r => { if (!db) return r(); try { const s = db.transaction("i").objectStore("i"), q = s.openCursor(); q.onsuccess = () => { const c = q.result; if (c) { IM[c.key] = URL.createObjectURL(c.value); c.continue() } else r() }; q.onerror = () => r() } catch (e) { r() } }) }
function idbPut(k, b) { try { db.transaction("i", "readwrite").objectStore("i").put(b, k) } catch (e) { } }
function idbDel(k) { try { db.transaction("i", "readwrite").objectStore("i").delete(k) } catch (e) { } }
function slot(i, k, cls = "", inner = "") {
    const u = IM[i + "|" + k];

    return `
    <div class="slot ${cls} ${u ? "has" : ""}"
      data-k="${i}|${k}"
      data-pick="${i}|${k}"
      style="--h:${F[i][2]};
      ${u ? `background-image:url(${u})` : ""}">

      ${inner}

      <span class="ph">＋ adicionar foto</span>

      ${u ? '<i class="x" title="Remover foto">×</i>' : ""}
    </div>
  `;
}
function pick(k) {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";

    inp.onchange = () => {
        const fl = inp.files[0];
        if (!fl) return;

        idbPut(k, fl);

        IM[k] = URL.createObjectURL(fl);

        refresh();
    };

    inp.click();
}
function spark(x, y, l) { for (let k = 0; k < 14; k++) { const s = document.createElement("span"); s.className = "spark"; s.textContent = l[k % l.length]; const a = Math.random() * 6.28, d = 50 + Math.random() * 90; s.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 40}px`; document.body.appendChild(s); setTimeout(() => s.remove(), 950) } }
function toast(t) { const e = $("toast"); e.textContent = t; e.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("show"), 2800) }
const isOpen = () => $("det").classList.contains("open"), mins = m => Math.floor(m / 60) + "h " + (m % 60) + "m";
function mark(i, e) {
    if (seen.has(i)) seen.delete(i); else {
        seen.add(i); if (e) spark(e.clientX, e.clientY, ["✨", "🌸", "🍃", "⭐", "💛"]);
        if (seen.size === N) { toast("Você assistiu a TODOS! 🎉"); for (let k = 0; k < 5; k++)setTimeout(() => spark(innerWidth * Math.random(), innerHeight * .4, ["🎉", "🌈", "✨"]), k * 250) } else if (seen.size % 5 === 0) toast(seen.size + " filmes! Continue assim 🌿")
    }
    sv("gh-seen", [...seen]); refresh()
}
function refresh() { draw(2); if (isOpen()) detail(cur, 1) }
function nav() {
    return `<div class="links">
    <button data-n="about">Sobre o Studio Ghibli</button>
    <button data-n="0" class="${view ? "" : "on"}">Feed de filmes</button>
    <button data-n="1" class="${view ? "on" : ""}">Checklist (${seen.size}/${N})</button>
    </div>` }
function setBg() { const b = $("bg"), u = IM[cur + "|hero"]; b.style.cssText = `--h:${F[cur][2]};${u ? `background-image:url(${u})` : ""}`; b.className = "slot " + (u ? "has" : "") }
function draw(anim) {
    setBg();
    view ? list() : feed(anim === 2)
}

let cnt = N, obs, sob;
function sec(k, nv) {
    const i = k % N, f = F[i], p = F[(i + N - 1) % N], n = F[(i + 1) % N], s = seen.has(i);
    return `<div class="fs ${nv ? "vis nv" : ""}" data-i="${i}">
    <section class="card">${slot(i, "hero")}
<div class="tint"></div>
<div class="diag"></div>

${slot(i, "character", "character-slot")}

<button class="character-upload" data-pick="${i}|character">
  📷 Adicionar personagem
</button>
    <div class="cn">${nav()}
    <button class="ham" data-n="1" aria-label="Checklist">☰</button>
    </div>
    <button class="cam" data-pick="${i}|hero">Trocar foto</button>
    <div class="yr">${f[1]}</div>
    <h1 class="serif">${f[0]}</h1>
    <div class="bt">
    <button class="wh" data-d="${i}">▶ VER DETALHES</button>
    <button class="tl" data-m="${i}">${s ? "✓ VISTO" : "MARCAR COMO VISTO"}</button>
    </div>
    <div class="ds">
    <p>${f[6]}</p>
    <p><b>Direção:</b> ${D[f[3]]}</p>
    </div>
    <div class="cnav">
    <button class="pn l" data-s="-1"><span>↑</span>${p[0]}</button>
    <button class="pn r" data-s="1">${n[0]}<span>↓</span></button>
    </div>
    </section>
    </div>`
}

function watch(r) { r.querySelectorAll(".fs:not([w])").forEach(e => { e.setAttribute("w", 1); obs.observe(e) }) }
function feed(keep) {
    const old = document.querySelector(".feed"), st = old ? old.scrollTop : 0; if (!keep) cnt = N;
    $("app").innerHTML = `<div class="feed">${Array.from({ length: cnt }, (_, k) => sec(k, keep)).join("")}<div class="end" style="height:2px"></div></div><div class="hint">role para ver mais ↓</div>`;
    const fd = document.querySelector(".feed");
    obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("vis"); const c = +e.target.dataset.i; if (c !== cur) { cur = c; setBg() } } }), { root: fd, threshold: .55 });
    sob = new IntersectionObserver(es => { if (es[0].isIntersecting) { const a = cnt; cnt += N; fd.querySelector(".end").insertAdjacentHTML("beforebegin", Array.from({ length: N }, (_, j) => sec(a + j)).join("")); watch(fd) } }, { root: fd, rootMargin: "900px" });
    sob.observe(fd.querySelector(".end")); watch(fd);
    fd.style.scrollBehavior = "auto"; fd.scrollTop = keep ? st : fd.querySelectorAll(".fs")[cur].offsetTop;
    requestAnimationFrame(() => { fd.style.scrollBehavior = "" });
    fd.addEventListener("scroll", () => { const h = document.querySelector(".hint"); if (h) h.remove() }, { once: true })
}

function list() {
    const p = Math.round(seen.size / N * 100);
    $("app").innerHTML = `<div class="lw">${nav()}
    <h2 class="serif" style="font-size:2.6rem;margin:0">Meu checklist</h2>
    <div style="color:var(--muted);font-weight:600;font-size:.85rem">${seen.size} de ${N} assistidos · ${p}%
    </div>
    <div class="bar">
    <i style="width:${p}%"></i>
    </div>
 <div class="grid">${F.map((f, i) => `<div class="fc ${seen.has(i) ? "seen" : ""}" data-o="${i}" tabindex="0">${slot(i, "hero")}<button class="ck" data-c="${i}" aria-label="Marcar ${f[0]} como visto">✓</button>
 <div class="m">
 <h3 class="serif">${f[0]}</h3><small>${f[1]} · ${D[f[3]]}</small></div>
 </div>`).join("")}</div>
 </div>`
}
function go(d) { cur = (cur + d + N) % N; if (isOpen()) detail(cur); draw(1) }
function detail(i, keep) {
    const f = F[i], el = $("det"), r = rate[i] || 0, t = txt; cur = i; el.classList.add("open"); document.body.style.overflow = "hidden"; if (!keep) el.scrollTop = 0;
    el.innerHTML = `<div class="top">
    <button id="dc" style="margin:0">← Voltar</button>
    <span>
    <button id="pv">‹</button>
    <button id="nx">›</button>
    </span>
    </div>
    <div class="dh">${slot(i, "hero")}
    <div class="tt">
    <h1 class="serif">${f[0]}</h1>
    <div class="mt">${f[1]} | ${mins(f[4])} | Idioma: Japonês</div>
    </div>
    </div>
    <div class="dc"><div class="row">${slot(i, "poster")}<div class="inf"><b>Dir. ${D[f[3]]}</b><br>Elenco: <span data-e="cast|${i}" data-ph="clique para escrever" contenteditable>${t["cast|" + i] || ""}</span><p>${f[6]}</p>${f[5].split(" ").map(g => `<span class="pill">${GN[g]}</span>`).join("")}</div>
    <div>
    <button class="rt" id="rt" aria-label="Sua nota">${r || "–"}</button>
    <div class="rl">SUA NOTA (clique)</div>
    </div>
    </div>
    <div class="gl">GALERIA</div>
    <div class="gal">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => slot(i, "g" + k)).join("")}</div>
    <div class="qt" data-e="q|${i}" data-ph="“Clique para escrever sua frase favorita do filme.”" contenteditable>${t["q|" + i] || ""}</div>
    </div>
    <div class="ft"><span><b>${f[0]}</b> | Studio Ghibli</span>
    <button id="dm">${seen.has(i) ? "✓ Visto" : "○ Marcar como visto"}</button>
    </div>
    <div class="strip">${[0, 1, 2, 3].map(k => slot(i, "s" + k)).join("")}</div>`;
    $("dc").onclick = () => { el.classList.remove("open"); document.body.style.overflow = ""; draw(0) };
    $("dm").onclick = e => mark(i, e); $("pv").onclick = () => go(-1); $("nx").onclick = () => go(1);
    $("rt").onclick = e => { rate[i] = ((rate[i] || 0) + 1) % 11; sv("gh-rate", rate); $("rt").textContent = rate[i] || "–"; if (rate[i] === 10) spark(e.clientX, e.clientY, ["⭐", "✨", "💛"]) };
    el.querySelectorAll("[data-e]").forEach(s => s.onblur = () => { txt[s.dataset.e] = s.textContent.trim(); sv("gh-txt", txt) })
}
document.addEventListener("click", e => {
    const T = e.target; let b;
    if (b = T.closest(".x")) { e.stopPropagation(); const k = b.parentNode.dataset.k; idbDel(k); delete IM[k]; refresh(); return }
    if (b = T.closest("[data-pick]")) { pick(b.dataset.pick); return }
    if (b = T.closest("[data-d]")) { detail(+b.dataset.d); return }
    if (b = T.closest("[data-m]")) { mark(+b.dataset.m, e); return }
    if (b = T.closest("[data-s]")) { const a = [...document.querySelectorAll(".fs")], t = a[a.indexOf(b.closest(".fs")) + +b.dataset.s]; if (t) t.scrollIntoView({ behavior: "smooth" }); return }
    if (T.closest("#det") && (b = T.closest(".slot"))) { pick(b.dataset.k); return }
    if (b = T.closest("[data-n]")) { const n = b.dataset.n; if (n === "about") $("ab").classList.add("open"); else { view = +n; draw(0) } return }
    if (b = T.closest(".ck")) { e.stopPropagation(); mark(+b.dataset.c, e); return }
    if (b = T.closest("[data-o]")) { detail(+b.dataset.o) }
});
document.addEventListener("keydown", e => {
    if (e.target.isContentEditable) return;
    if (e.key === "Escape") { if ($("ab").classList.contains("open")) $("ab").classList.remove("open"); else if (isOpen()) $("dc").click() }
    else if (!view && !isOpen() && /^Arrow(Down|Up|Right|Left)$/.test(e.key)) { const f = document.querySelector(".feed"); if (f) f.scrollBy({ top: /Down|Right/.test(e.key) ? innerHeight : -innerHeight, behavior: "smooth" }); e.preventDefault() }
    else if (e.key === "Enter" && e.target.dataset.o !== undefined) detail(+e.target.dataset.o)
});
$("abx").onclick = () => $("ab").classList.remove("open");
idb().then(idbAll).then(() => draw(0));