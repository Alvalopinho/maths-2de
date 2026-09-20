/* Page maths : programme à cocher, fiches, labo des probabilités. */
(function(){
  "use strict";
  var M = window.MS;
  var el = M.el, str = M.str, arr = M.arr, save = M.save, LS = M.LS;
  var checkState = M.checkState, doneState = M.doneState;
  var MATIERE = "maths";

  var PART_LABEL = {
    nombres:"Nombres & algèbre", geometrie:"Géométrie",
    fonctions:"Fonctions", stats:"Stats & probas", transversal:"Fil rouge"
  };

  /* ---------- labo ---------- */
  function initLabo(){
    var prev = document.getElementById("prev"), sens = document.getElementById("sens"), spec = document.getElementById("spec");
    if (!prev || !sens || !spec) return;
    var prevV = document.getElementById("prevV"), sensV = document.getElementById("sensV"), specV = document.getElementById("specV");
    var ppv = document.getElementById("ppv"), detail = document.getElementById("detail"), dotsBox = document.getElementById("dots");
    var dotEls = [];
    for (var i = 0; i < 200; i++){ var dd = el("span","dot"); dotsBox.appendChild(dd); dotEls.push(dd); }
    function calc(){
      var p = prev.value / 10, se = +sens.value, sp = +spec.value;
      prevV.textContent = (p % 1 === 0 ? p : p.toFixed(1)) + " %";
      sensV.textContent = se + " %"; specV.textContent = sp + " %";
      var malades = 1000 * p / 100, tp = malades * se / 100, fp = (1000 - malades) * (100 - sp) / 100;
      ppv.textContent = Math.round((tp + fp) > 0 ? tp / (tp + fp) * 100 : 0) + " %";
      detail.textContent = "Sur 1 000 personnes : " + Math.round(tp + fp) + " tests positifs, dont " + Math.round(tp) + " vrais malades et " + Math.round(fp) + " fausses alertes.";
      var tpD = Math.round(tp / 5), fpD = Math.round(fp / 5);
      dotEls.forEach(function(n, idx){ n.className = "dot" + (idx < tpD ? " tp" : (idx < tpD + fpD ? " pos" : "")); });
    }
    [prev, sens, spec].forEach(function(n){ n.addEventListener("input", calc); });
    calc();
  }

  /* ---------- programme ---------- */
  var boxes = [];
  function renderProgramme(parties){
    var host = document.getElementById("partsList");
    host.textContent = "";
    boxes = [];
    parties.forEach(function(p, idx){
      var det = el("details","part");
      if (idx === 0) det.open = true;
      var sum = document.createElement("summary");
      sum.appendChild(el("span","num", String(p.num)));
      sum.appendChild(document.createTextNode(" " + str(p.titre) + " "));
      var car = el("span");
      car.className = "caret";
      car.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>';
      sum.appendChild(car);
      det.appendChild(sum);
      var ul = document.createElement("ul");
      arr(p.notions).forEach(function(n){
        var li = document.createElement("li");
        var lab = document.createElement("label");
        var inp = document.createElement("input");
        inp.type = "checkbox"; inp.dataset.k = str(n.k);
        inp.checked = !!checkState[n.k];
        inp.addEventListener("change", function(){
          checkState[n.k] = inp.checked; save(LS.check, checkState); paint();
        });
        lab.appendChild(inp);
        lab.appendChild(el("span", null, str(n.texte)));
        li.appendChild(lab); ul.appendChild(li);
        boxes.push(inp);
      });
      det.appendChild(ul);
      host.appendChild(det);
    });
    paint();
  }
  function paint(){
    var fill = document.getElementById("progFill"), ptext = document.getElementById("progText");
    boxes.forEach(function(b){ b.checked = !!checkState[b.dataset.k]; });
    var n = boxes.filter(function(b){ return b.checked; }).length;
    var total = boxes.length || 1;
    fill.style.width = (n / total * 100) + "%";
    var msg = n + " / " + boxes.length + " notions cochées";
    if (boxes.length && n === boxes.length) msg += " — programme bouclé.";
    else if (n >= boxes.length / 2) msg += " — plus de la moitié.";
    ptext.textContent = msg;
  }

  /* ---------- fiches ---------- */
  var fiches = [], filter = "all";

  function buildFiche(f){
    var wrapEl = el("details","fiche");
    if (doneState[f.id]) wrapEl.classList.add("done");
    var sum = document.createElement("summary");
    var tb = el("div");
    tb.appendChild(el("span","f-part", PART_LABEL[str(f.partie)] || "Notion"));
    tb.appendChild(el("div","f-title", str(f.titre) || "Fiche"));
    sum.appendChild(tb);
    var mark = el("span","f-done");
    mark.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l6 6L20 6"/></svg>';
    sum.appendChild(mark);
    wrapEl.appendChild(sum);

    var body = el("div","f-body");
    if (str(f.idee)){
      var b1 = el("div","f-block");
      b1.appendChild(el("div","f-lab","L'idée"));
      b1.appendChild(el("p","f-idee", f.idee));
      body.appendChild(b1);
    }
    if (arr(f.methode).length){
      var b2 = el("div","f-block");
      b2.appendChild(el("div","f-lab","La méthode"));
      var ol = document.createElement("ol");
      arr(f.methode).forEach(function(s){ ol.appendChild(el("li",null,str(s))); });
      b2.appendChild(ol); body.appendChild(b2);
    }
    if (str(f.erreur)){
      var b3 = el("div","f-block");
      b3.appendChild(el("div","f-lab","L'erreur classique"));
      b3.appendChild(el("p","f-err", f.erreur));
      body.appendChild(b3);
    }
    var ex = f.exercice && typeof f.exercice === "object" ? f.exercice : null;
    if (ex && str(ex.enonce)){
      var b4 = el("div","f-block");
      b4.appendChild(el("div","f-lab","Exercice type"));
      var box = el("div","f-ex");
      box.appendChild(el("p", null, ex.enonce));
      if (str(ex.corrige)){
        var btn = el("button","btn btn-ghost btn-sm","Voir le corrigé");
        btn.type = "button"; btn.style.marginTop = ".8rem";
        var cor = el("div","f-cor", ex.corrige);
        cor.hidden = true;
        btn.addEventListener("click", function(){
          cor.hidden = !cor.hidden;
          btn.textContent = cor.hidden ? "Voir le corrigé" : "Masquer le corrigé";
        });
        box.appendChild(btn); box.appendChild(cor);
      }
      b4.appendChild(box); body.appendChild(b4);
    }

    M.ficheActions(f, wrapEl, body, MATIERE);
    wrapEl.appendChild(body);
    return wrapEl;
  }

  function renderFiches(){
    var host = document.getElementById("fichesList");
    var shown = fiches.filter(function(f){ return filter === "all" || f.partie === filter; });
    host.textContent = "";
    if (!shown.length){
      host.appendChild(el("div","f-empty", fiches.length
        ? "Aucune fiche dans cette partie pour l'instant."
        : "Les fiches arriveront au fil des chapitres. Reviens après le prochain cours."));
      return;
    }
    shown.forEach(function(f){ host.appendChild(buildFiche(f)); });
  }

  function renderFilters(parties){
    var host = document.getElementById("filters");
    host.textContent = "";
    var defs = [{f:"all", label:"Toutes"}].concat(parties.map(function(p){
      return { f: str(p.id), label: PART_LABEL[str(p.id)] || str(p.titre) };
    }));
    defs.forEach(function(d){
      var b = el("button","filt", d.label);
      b.type = "button"; b.dataset.f = d.f;
      b.setAttribute("aria-pressed", d.f === "all" ? "true" : "false");
      b.addEventListener("click", function(){
        filter = d.f;
        Array.prototype.forEach.call(host.children, function(o){
          o.setAttribute("aria-pressed", o === b ? "true" : "false");
        });
        renderFiches();
      });
      host.appendChild(b);
    });
  }

  /* ---------- sections statiques issues du JSON ---------- */
  function renderRest(p){
    var src = p.source || {};
    document.getElementById("srcNote").textContent = "Programme officiel : " + str(src.texte) + ".";
    var link = document.getElementById("srcLink");
    if (str(src.url)) link.href = src.url; else link.remove();

    var ch = document.getElementById("changeList");
    arr(p.changements).forEach(function(c){
      var card = el("div","card" + (c.ton === "lime" ? " lime" : ""));
      card.appendChild(el("h3", null, str(c.titre)));
      card.appendChild(el("p", null, str(c.texte)));
      ch.appendChild(card);
    });

    var fl = document.getElementById("filsList");
    arr(p.filsRouges).forEach(function(f){
      var card = el("div","card");
      card.appendChild(el("h3", null, str(f.titre)));
      card.appendChild(el("p", null, str(f.texte)));
      if (str(f.tag)) card.appendChild(el("span","tag" + (f.ton === "corail" ? " corail" : ""), f.tag));
      fl.appendChild(card);
    });

    var il = document.getElementById("intoxList");
    arr(p.intox).forEach(function(q){
      var b = el("button","flip");
      b.type = "button"; b.setAttribute("aria-expanded","false");
      var inner = el("div","flip-in");
      var front = el("div","face");
      var quote = document.createElement("q");
      quote.textContent = str(q.rumeur);
      front.appendChild(quote);
      front.appendChild(el("span","hint","Appuie pour voir le verdict →"));
      var back = el("div","face back");
      back.appendChild(el("span","verdict " + (q.verdict === "VRAI" ? "v-vrai" : "v-faux"), str(q.verdict)));
      back.appendChild(el("p", null, str(q.reponse)));
      inner.appendChild(front); inner.appendChild(back);
      b.appendChild(inner);
      b.addEventListener("click", function(){
        b.setAttribute("aria-expanded", b.getAttribute("aria-expanded") === "true" ? "false" : "true");
      });
      il.appendChild(b);
    });

    var sl = document.getElementById("skillsList");
    arr(p.competences).forEach(function(c){
      var d = el("div","skill");
      d.appendChild(el("b", null, str(c.nom)));
      d.appendChild(el("span", null, str(c.glose)));
      sl.appendChild(d);
    });

    var rl = document.getElementById("reservesList");
    arr(p.reserves).forEach(function(t){ rl.appendChild(el("p", null, str(t))); });
  }

  /* ---------- démarrage ---------- */
  initLabo();
  document.getElementById("reset").addEventListener("click", function(){
    Object.keys(checkState).forEach(function(k){ delete checkState[k]; });
    save(LS.check, checkState); paint();
  });

  Promise.all([ M.getJSON("content/programme.json"), M.getJSON("content/fiches.json") ])
    .then(function(res){
      var prog = res[0];
      fiches = arr(res[1]).slice().sort(function(a,b){ return (a.ordre||0) - (b.ordre||0); });
      renderProgramme(arr(prog.parties));
      renderFilters(arr(prog.parties));
      renderFiches();
      renderRest(prog);
      M.renderBlocages(MATIERE);
      M.watchReveals();
    })
    .catch(function(){
      M.fail("fichesList", M.CHARGEMENT);
      M.renderBlocages(MATIERE);
      M.watchReveals();
    });
})();
