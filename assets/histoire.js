/* Page histoire : fiches de chapitre du tronc commun. */
(function(){
  "use strict";
  var M = window.MS;
  var el = M.el, str = M.str, arr = M.arr;
  var doneState = M.doneState;
  var MATIERE = "histoire";

  function buildFiche(f){
    var wrapEl = el("details","fiche");
    if (doneState[f.id]) wrapEl.classList.add("done");

    var sum = document.createElement("summary");
    var tb = el("div");
    tb.appendChild(el("span","f-part", str(f.theme) || "Chapitre"));
    tb.appendChild(el("div","f-title", str(f.titre) || "Fiche"));
    sum.appendChild(tb);
    var mark = el("span","f-done");
    mark.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l6 6L20 6"/></svg>';
    sum.appendChild(mark);
    wrapEl.appendChild(sum);

    var body = el("div","f-body");

    if (str(f.duree)){
      var meta = el("div","h-meta");
      meta.appendChild(el("span","h-duree", str(f.duree)));
      body.appendChild(meta);
    }

    if (str(f.problematique)){
      var b0 = el("div","f-block");
      b0.appendChild(el("div","f-lab","La problématique"));
      b0.appendChild(el("p","h-pb", f.problematique));
      body.appendChild(b0);
    }

    var rep = f.reperes && typeof f.reperes === "object" ? f.reperes : null;
    if (rep && arr(rep.lignes).length){
      var b1 = el("div","f-block");
      b1.appendChild(el("div","f-lab", str(rep.titre) || "Les repères"));
      var scroll = el("div","h-wrapt");
      var tbl = el("table","h-tab");
      var thead = document.createElement("thead");
      var trh = document.createElement("tr");
      arr(rep.colonnes).forEach(function(c){
        var th = document.createElement("th");
        th.textContent = str(c);
        trh.appendChild(th);
      });
      thead.appendChild(trh); tbl.appendChild(thead);
      var tbody = document.createElement("tbody");
      arr(rep.lignes).forEach(function(ligne){
        var tr = document.createElement("tr");
        arr(ligne).forEach(function(cell){
          var td = document.createElement("td");
          td.textContent = str(cell);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      tbl.appendChild(tbody);
      scroll.appendChild(tbl);
      b1.appendChild(scroll);
      if (str(rep.note)) b1.appendChild(el("p","h-note", rep.note));
      body.appendChild(b1);
    }

    arr(f.blocs).forEach(function(bl){
      if (!arr(bl.points).length) return;
      var b = el("div","f-block");
      b.appendChild(el("div","f-lab", str(bl.titre)));
      var ul = el("ul","h-list" + (bl.ton === "coral" ? " coral" : ""));
      arr(bl.points).forEach(function(p){ ul.appendChild(el("li", null, str(p))); });
      b.appendChild(ul);
      body.appendChild(b);
    });

    if (str(f.retenir)){
      var b2 = el("div","f-block");
      b2.appendChild(el("div","f-lab","À retenir en une phrase"));
      b2.appendChild(el("p","h-ret", f.retenir));
      body.appendChild(b2);
    }

    if (str(f.activite)){
      var b3 = el("div","f-block");
      b3.appendChild(el("div","f-lab","Activité type"));
      b3.appendChild(el("p","h-act", f.activite));
      body.appendChild(b3);
    }

    M.ficheActions(f, wrapEl, body, MATIERE);
    wrapEl.appendChild(body);
    return wrapEl;
  }

  function render(data){
    var host = document.getElementById("histoireList");
    var list = arr(data.fiches).slice().sort(function(a,b){ return (a.ordre||0) - (b.ordre||0); });
    host.textContent = "";
    if (!list.length){
      host.appendChild(el("div","f-empty","Les chapitres arriveront au fil de l'année. Reviens après le prochain cours."));
    } else {
      list.forEach(function(f){ host.appendChild(buildFiche(f)); });
    }
    var src = data.source || {};
    var note = document.getElementById("srcNote");
    if (note && str(src.texte)) note.textContent = "Programme officiel : " + src.texte + ".";
    var sous = document.getElementById("intitule");
    if (sous && str(data.intitule)) sous.textContent = str(data.intitule);
  }

  M.getJSON("content/histoire.json")
    .then(function(data){
      render(data);
      M.renderBlocages(MATIERE);
      M.watchReveals();
    })
    .catch(function(){
      M.fail("histoireList", M.CHARGEMENT);
      M.renderBlocages(MATIERE);
      M.watchReveals();
    });
})();
