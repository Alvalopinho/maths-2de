/* Socle commun aux pages : helpers, stockage local, thème, blocages, fiches. */
(function(){
  "use strict";

  var LS = { check:"m2d-check", done:"m2d-done", bloc:"m2d-bloc", theme:"m2d-theme" };

  function el(tag, cls, txt){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function str(v){ return typeof v === "string" ? v : ""; }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function load(key, fallback){
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch(e){ return fallback; }
  }
  function save(key, val){ try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} }

  /* ---------- thème ---------- */
  try {
    var sv = localStorage.getItem(LS.theme);
    if (sv) document.documentElement.setAttribute("data-theme", JSON.parse(sv));
  } catch(e){}
  var tBtn = document.getElementById("theme");
  if (tBtn) tBtn.addEventListener("click", function(){
    var cur = document.documentElement.getAttribute("data-theme")
      || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    save(LS.theme, next);
  });

  /* ---------- barre de scroll ---------- */
  var bar = document.getElementById("progress");
  if (bar){
    var onScroll = function(){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, {passive:true});
    onScroll();
  }

  /* ---------- état local, partagé entre les matières ---------- */
  var checkState = load(LS.check, {});
  var doneState  = load(LS.done, {});
  var blocages   = arr(load(LS.bloc, []));

  /* Les notes écrites avant la séparation des matières n'ont pas de champ
     « matiere » : elles viennent forcément de la page de maths. */
  function matiereDe(b){ return str(b && b.matiere) || "maths"; }

  /* ---------- blocages ---------- */
  function renderBlocages(matiere){
    var host = document.getElementById("bList");
    if (!host) return;
    host.textContent = "";

    /* On garde l'indice réel dans le tableau complet : la suppression doit
       porter sur la bonne entrée, pas sur celle de la liste filtrée. */
    var visibles = [];
    blocages.forEach(function(b, i){
      if (matiereDe(b) === matiere) visibles.push({ b:b, i:i });
    });

    if (!visibles.length){
      var vide = el("div","f-empty","Rien pour l'instant. Utilise « Je bloque » sur une fiche.");
      vide.style.gridColumn = "1/-1";
      host.appendChild(vide);
      return;
    }

    visibles.forEach(function(entry){
      var b = entry.b;
      var item = el("div","q-item");
      var when = "";
      try { when = new Date(b.date).toLocaleDateString("fr-FR",{day:"numeric",month:"long"}); } catch(e){}
      item.appendChild(el("div","q-meta", (str(b.ficheTitre) || "Note") + (when ? " · " + when : "")));
      item.appendChild(el("p","q-txt", str(b.texte)));

      var acts = el("div","q-act");
      var sendB = el("button","btn btn-ghost btn-sm","Envoyer");
      sendB.type = "button";
      sendB.addEventListener("click", function(){
        var msg = "Je bloque sur « " + str(b.ficheTitre) + " » : " + str(b.texte);
        if (navigator.share){
          navigator.share({ title:"Ma seconde", text: msg }).catch(function(){});
        } else if (navigator.clipboard){
          navigator.clipboard.writeText(msg).then(function(){ sendB.textContent = "Copié ✓"; }).catch(function(){});
        } else {
          window.location.href = "mailto:?subject=" + encodeURIComponent("Ma seconde — je bloque") + "&body=" + encodeURIComponent(msg);
        }
      });
      var delB = el("button","reset","Supprimer");
      delB.type = "button";
      delB.addEventListener("click", function(){
        blocages.splice(entry.i, 1);
        save(LS.bloc, blocages);
        renderBlocages(matiere);
      });
      acts.appendChild(sendB); acts.appendChild(delB);
      item.appendChild(acts);
      host.appendChild(item);
    });
  }

  /* ---------- bas de fiche : « compris » et « je bloque » ---------- */
  function ficheActions(f, wrapEl, body, matiere){
    var actions = el("div","f-actions");
    var okBtn = el("button","btn btn-ghost btn-sm", doneState[f.id] ? "Compris ✓" : "Marquer comme compris");
    okBtn.type = "button";
    okBtn.addEventListener("click", function(){
      doneState[f.id] = !doneState[f.id];
      wrapEl.classList.toggle("done", !!doneState[f.id]);
      okBtn.textContent = doneState[f.id] ? "Compris ✓" : "Marquer comme compris";
      save(LS.done, doneState);
    });
    var askBtn = el("button","btn btn-ghost btn-sm","Je bloque");
    askBtn.type = "button";
    actions.appendChild(okBtn); actions.appendChild(askBtn);
    body.appendChild(actions);

    var ask = el("div","ask");
    var ta = document.createElement("textarea");
    ta.placeholder = "Qu'est-ce qui coince exactement ?";
    ta.setAttribute("aria-label","Ce qui te bloque sur cette fiche");
    var saveB = el("button","btn btn-primary btn-sm","Garder cette note");
    saveB.type = "button"; saveB.style.marginTop = ".6rem";
    ask.appendChild(ta); ask.appendChild(saveB);
    ask.appendChild(el("p","ask-note","Enregistré sur cet appareil uniquement. Rien n'est envoyé."));
    body.appendChild(ask);

    askBtn.addEventListener("click", function(){
      ask.classList.toggle("open");
      if (ask.classList.contains("open")) ta.focus();
    });
    saveB.addEventListener("click", function(){
      var txt = ta.value.trim();
      if (!txt) return;
      blocages.unshift({
        texte: txt, fiche: f.id, ficheTitre: str(f.titre),
        matiere: matiere, date: new Date().toISOString()
      });
      save(LS.bloc, blocages);
      ta.value = ""; ask.classList.remove("open");
      renderBlocages(matiere);
    });
  }

  /* ---------- apparition au scroll ---------- */
  function watchReveals(){
    var nodes = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)){
      Array.prototype.forEach.call(nodes, function(n){ n.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
    }, {rootMargin:"0px 0px -8% 0px"});
    Array.prototype.forEach.call(nodes, function(n){ io.observe(n); });
  }

  function fail(hostId, msg){
    var host = document.getElementById(hostId);
    if (!host) return;
    host.textContent = "";
    host.appendChild(el("div","err-box", msg));
  }

  var CHARGEMENT = "Le contenu n'a pas pu être chargé. Si tu ouvres ce fichier directement "
    + "depuis ton disque, lance plutôt un petit serveur local (voir le README) — les "
    + "navigateurs bloquent la lecture de fichiers en local.";

  function getJSON(url){
    return fetch(url).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); });
  }

  window.MS = {
    el:el, str:str, arr:arr, load:load, save:save, LS:LS,
    checkState:checkState, doneState:doneState, blocages:blocages,
    renderBlocages:renderBlocages, ficheActions:ficheActions,
    watchReveals:watchReveals, fail:fail, getJSON:getJSON, CHARGEMENT:CHARGEMENT
  };
})();
