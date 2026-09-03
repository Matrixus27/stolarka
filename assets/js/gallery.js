// F.H.U.P. Damian Chrustowicz — dynamiczna galeria realizacji
// Dane wczytywane z assets/data/items.json (edytowane w panelu Pages CMS).
// Zdjęcia serwowane bezpośrednio z repo — bez automatycznego resize'u,
// więc warto przed wgraniem lekko zmniejszyć zdjęcia z telefonu/aparatu
// (np. do ok. 1600-2000px szerokości), żeby galeria ładowała się szybko.
(function () {
  function imgUrl(path) {
    var clean = String(path || '').replace(/^\/+/, '');
    return '/' + clean;
  }

  function buildCard(item) {
    var a = document.createElement('a');
    a.className = 'gallery-item is-visible';
    a.href = imgUrl(item.zdjecie);
    a.target = '_blank';
    a.rel = 'noopener';

    var img = document.createElement('img');
    img.src = imgUrl(item.zdjecie);
    img.loading = 'lazy';
    img.alt = item.podpis || item.kategoria || 'Realizacja — F.H.U.P. Damian Chrustowicz';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.display = 'block';
    a.appendChild(img);

    if (item.podpis) {
      var tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = item.podpis;
      a.appendChild(tag);
    }
    return a;
  }

  function emptyNote(text) {
    var p = document.createElement('p');
    p.className = 'gallery-note';
    p.textContent = text;
    return p;
  }

  async function init() {
    var root = document.getElementById('gallery-root');
    if (!root) return;

    var data;
    try {
      var res = await fetch('/assets/data/items.json', { cache: 'no-store' });
      data = await res.json();
    } catch (e) {
      root.innerHTML = '';
      root.appendChild(emptyNote('Nie udało się wczytać galerii — spróbuj odświeżyć stronę.'));
      return;
    }

    var items = (Array.isArray(data.realizacje) ? data.realizacje.slice() : []).reverse();
    var onlyCategory = root.getAttribute('data-category');
    var limit = parseInt(root.getAttribute('data-limit') || '0', 10);
    var filtersEl = document.getElementById('gallery-filters');

    function render(activeCat) {
      root.innerHTML = '';
      var filtered = items;
      if (onlyCategory) {
        filtered = items.filter(function (i) { return i.kategoria === onlyCategory; });
      } else if (activeCat && activeCat !== '__all__') {
        filtered = items.filter(function (i) { return i.kategoria === activeCat; });
      }
      if (limit > 0) filtered = filtered.slice(0, limit);

      if (!filtered.length) {
        root.appendChild(emptyNote('Zdjęcia tej kategorii pojawią się tu wkrótce.'));
        return;
      }
      filtered.forEach(function (item) { root.appendChild(buildCard(item)); });
    }

    if (filtersEl && !onlyCategory) {
      var cats = Array.from(new Set(items.map(function (i) { return i.kategoria; }).filter(Boolean)));
      filtersEl.innerHTML = '';

      var params = new URLSearchParams(location.search);
      var katParam = params.get('kat');
      var chips = [];

      function makeChip(label, catValue) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'subcat-chip';
        chip.textContent = label;
        chip.addEventListener('click', function () {
          chips.forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          render(catValue);
        });
        filtersEl.appendChild(chip);
        chips.push(chip);
        return chip;
      }

      var allChip = makeChip('Wszystkie', '__all__');
      cats.forEach(function (cat) { makeChip(cat, cat); });

      var startCat = '__all__';
      var startChip = allChip;
      if (katParam) {
        var idx = cats.indexOf(katParam);
        if (idx > -1) {
          startCat = katParam;
          startChip = chips[idx + 1];
        }
      }
      startChip.classList.add('active');
      render(startCat);
    } else {
      render(null);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
