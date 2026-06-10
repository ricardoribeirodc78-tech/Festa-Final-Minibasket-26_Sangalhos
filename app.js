let jogos = [];
const els = {
  list: document.getElementById('gamesList'),
  summary: document.getElementById('summary'),
  search: document.getElementById('searchInput'),
  escalao: document.getElementById('escalaoFilter'),
  campo: document.getElementById('campoFilter'),
  pavilhao: document.getElementById('pavilhaoFilter'),
  clear: document.getElementById('clearBtn')
};

function unique(values){ return [...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt')); }

function fillSelect(select, values){
  values.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

function normalize(text){
  return (text || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
}

function gameMatches(game){
  const q = normalize(els.search.value);
  const text = normalize(`${game.equipaA} ${game.equipaB}`);
  return (!q || text.includes(q))
    && (!els.escalao.value || game.escalao === els.escalao.value)
    && (!els.campo.value || game.campo === els.campo.value)
    && (!els.pavilhao.value || game.pavilhao === els.pavilhao.value);
}

function render(){
  const filtered = jogos.filter(gameMatches);

  els.summary.innerHTML = `
    <span class="pill"><strong>${filtered.length}</strong> jogos encontrados</span>
    <span class="pill">${els.escalao.value || 'Todos os escalões'}</span>
    <span class="pill">${els.campo.value || 'Todos os campos'}</span>
  `;

  if(!filtered.length){
    els.list.innerHTML = `<div class="card info"><h2>Sem jogos encontrados</h2><p>Experimente limpar os filtros ou pesquisar outra equipa.</p></div>`;
    return;
  }

  els.list.innerHTML = filtered.map(g => `
    <article class="game">
      <div class="meta">
        <div>
          <div class="time">${g.horario}</div>
          <div>${g.escalao}</div>
        </div>
        <div>Jogo ${g.jogo || '-'}</div>
      </div>

      <div class="teams">
        ${g.equipaA}
        <span class="versus">vs</span>
        ${g.equipaB}
      </div>

      <div class="details">
        <span class="detail">${g.pavilhao}</span>
        <span class="detail">${g.campo}</span>
        ${g.codigo ? `<span class="detail">Código ${g.codigo}</span>` : ''}
      </div>
    </article>
  `).join('');
}

async function init(){
  const response = await fetch('jogos.json');
  jogos = await response.json();

  fillSelect(els.escalao, unique(jogos.map(g=>g.escalao)));
  fillSelect(els.campo, unique(jogos.map(g=>g.campo)));
  fillSelect(els.pavilhao, unique(jogos.map(g=>g.pavilhao)));

  [els.search, els.escalao, els.campo, els.pavilhao].forEach(el => {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  els.clear.addEventListener('click', () => {
    els.search.value = '';
    els.escalao.value = '';
    els.campo.value = '';
    els.pavilhao.value = '';
    render();
  });

  render();
}
init();
