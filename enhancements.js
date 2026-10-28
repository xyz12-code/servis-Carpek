
'use strict';
// Rozsireni demonstracni aplikace Servis Carpek. Data jsou pouze v tomto prohlizeci.
(function(){
  const style=document.createElement('style');
  style.textContent=[
    '.job .controls{flex-wrap:wrap}.job .controls select{width:auto;flex:1 1 120px}.job .controls button{flex:1 1 auto}',
    '.editorBar{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px}',
    '.editorGrid{display:grid;grid-template-columns:1fr;gap:14px}.editorGrid .sheet{margin:0}',
    '.photoGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(136px,1fr));gap:12px;margin-top:15px}',
    '.photoTile{border:1px solid #dce3eb;border-radius:12px;overflow:hidden;background:#f8fafc}',
    '.photoTile img{width:100%;height:133px;object-fit:cover;display:block}.photoTile .caption{padding:9px;font-size:12px;word-break:break-word}',
    '.photoTile .caption strong{display:block}.photoTile .caption button{border:1px solid #fecaca;color:#991b1b;background:white;padding:6px;border-radius:7px;margin-top:7px}',
    '.partItem{border:1px solid #dce3eb;border-radius:12px;padding:12px;margin-top:10px}.partItem .buttonbar button{min-height:35px;padding:7px}',
    '.bigPhoto{position:fixed;z-index:100;inset:0;padding:18px;background:rgba(6,12,25,.95);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px}',
    '.bigPhoto img{max-width:100%;max-height:75vh;object-fit:contain}.bigPhoto p{color:white;text-align:center;margin:0}',
    '@media(min-width:760px){.editorGrid{grid-template-columns:1fr 1fr}.editorFull{grid-column:1 / -1}}'
  ].join('\n');
  document.head.append(style);

  const div=document.createElement('div');
  div.id='pageDetail';div.className='hidden';
  div.innerHTML=[
   '<div class="editorBar"><button class="btn secondary" id="backToJobs" type="button">← Přehled zakázek</button><span id="editBadge" class="chip blue">Zakázka</span></div>',
   '<h1 id="editHeading">Detail zakázky</h1><p id="editSubheading" class="muted" style="margin-bottom:17px"></p>',
   '<div class="editorGrid">',
   '<section class="sheet"><h2>✏️ Údaje vozidla a zakázky</h2><p class="help">Údaje lze doplnit kdykoliv. Po změně stiskni Uložit.</p>',
   '<label>VIN</label><input id="ed_vin" maxlength="17" class="vinfield" autocapitalize="characters" spellcheck="false">',
   '<div class="row"><div><label>Značka</label><input id="ed_make"></div><div><label>Model</label><input id="ed_model"></div></div>',
   '<div class="row"><div><label>Rok</label><input id="ed_year"></div><div><label>Palivo</label><input id="ed_fuel"></div></div>',
   '<div class="row"><div><label>Motor</label><input id="ed_engine"></div><div><label>Výkon (kW)</label><input id="ed_power"></div></div>',
   '<div class="row"><div><label>SPZ</label><input id="ed_plate"></div><div><label>Stav km</label><input type="number" min="0" id="ed_km"></div></div>',
   '<div class="row"><div><label>Mechanik</label><select id="ed_mechanic"><option>Petr</option><option>Honza</option><option>Tomáš</option><option>Karel</option><option>David</option></select></div>',
   '<div><label>Stav zakázky</label><select id="ed_status"><option>Přijato</option><option>Rozpracováno</option><option>Čeká na díly</option><option>Čeká na schválení</option><option>Hotovo</option><option>Předáno</option></select></div></div>',
   '<div class="row"><div><label>Jméno zákazníka</label><input id="ed_customer"></div><div><label>Telefon</label><input id="ed_phone" type="tel"></div></div>',
   '<label>Popis závady / plánované práce</label><textarea id="ed_work" rows="4"></textarea>',
   '<label>Požadovaný termín</label><input id="ed_deadline" type="date">',
   '<button id="saveEditedJob" type="button" class="btn green wide" style="margin-top:17px">✓ Uložit změny</button>',
   '<div id="editNotice" class="status hidden" role="status"></div></section>',
   '<section class="sheet"><h2>📦 Použité a potřebné díly</h2>',
   '<p class="help">Číslo dílu, název a počet kusů. Šéf pak může podle katalogových čísel dohledat ceny.</p>',
   '<label>Číslo dílu</label><input id="partNo" placeholder="Např. 1K0 615 301 AA">',
   '<label>Název dílu</label><input id="partTitle" placeholder="Např. Brzdový kotouč">',
   '<div class="row"><div><label>Počet / množství</label><input id="partAmount" type="number" min="0.01" step="0.01" value="1"></div>',
   '<div><label>Použití</label><select id="partUsage"><option value="Použito">Použito</option><option value="Potřeba objednat">Potřeba objednat</option></select></div></div>',
   '<label>Poznámka</label><input id="partMemo" placeholder="Volitelné">',
   '<div class="buttonbar"><button class="btn primary" type="button" id="commitPart">＋ Přidat díl</button><button class="btn secondary hidden" type="button" id="cancelPart">Zrušit úpravu</button></div>',
   '<div id="partRows"></div></section>',
   '<section class="sheet editorFull"><h2>📷 Fotodokumentace poškození a opravy</h2>',
   '<p class="help">Fotografie lze přidávat i do rozpracované zakázky. Klepni na fotografii pro velké zobrazení zákazníkovi.</p>',
   '<div class="row"><div><label>Typ fotografie</label><select id="photoKind"><option>Při převzetí</option><option selected>Poškození</option><option>Průběh opravy</option><option>Po opravě</option></select></div>',
   '<div><label>Popis fotografie</label><input id="photoMemo" placeholder="Např. netěsný chladič"></div></div>',
   '<div class="buttonbar"><label class="btn primary upload wide" style="margin:0;color:white">📷 Přidat fotografie<input type="file" id="addMorePhotos" accept="image/*" multiple capture="environment"></label></div>',
   '<p class="help">Demo: nejvýše 12 zmenšených fotek na zakázku, uložených pouze v tomto prohlížeči. Pro provozní verzi je potřeba cloudové úložiště.</p>',
   '<div id="photoNotice" class="status hidden" role="status"></div><div id="photoTiles" class="photoGrid"></div></section>',
   '<section class="sheet editorFull"><h2>🕓 Historie úprav</h2><div id="jobHistory" class="muted"></div></section>',
   '</div>'
  ].join('');
  const footer=document.querySelector('main .foot');
  footer.parentNode.insertBefore(div,footer);

  const zoom=document.createElement('div');zoom.id='photoZoom';zoom.className='bigPhoto hidden';
  zoom.innerHTML='<button type="button" id="zoomClose" class="btn secondary">✕ Zavřít</button><img id="zoomImage" alt="Zvětšená fotografie závady"><p id="zoomCaption"></p>';
  document.body.append(zoom);
  $('zoomClose').addEventListener('click',()=>zoom.classList.add('hidden'));
  zoom.addEventListener('click',e=>{if(e.target===zoom)zoom.classList.add('hidden')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')zoom.classList.add('hidden')});

  let currentId=null,partIndex=-1;
  const editKeys=['vin','make','model','year','fuel','engine','power','plate','km','mechanic','customer','phone','work','deadline'];
  const current=()=>jobs.find(j=>j.id===currentId);
  const note=(id,message,type)=>{status($(id),message,type);$(id).classList.remove('hidden')};
  function history(j,action){
    if(!Array.isArray(j.history))j.history=[];
    j.history.unshift({at:new Date().toISOString(),actor:j.mechanic||'Mechanik',action});
    if(j.history.length>100)j.history.length=100;
  }
  function normalizePhotos(j){
    if(!Array.isArray(j.photoEntries))j.photoEntries=[];
    if(Array.isArray(j.photos)&&j.photos.length){
      j.photoEntries.unshift(...j.photos.map(src=>({src,kind:'Při převzetí',memo:'Fotografie založení zakázky',date:j.createdAt})));
      j.photos=[];persist();
    }
    return j.photoEntries;
  }
  function refreshHead(j){
    $('editHeading').textContent=([j.make,j.model].filter(Boolean).join(' ')||'Vozidlo bez modelu')+' · '+(j.plate||'bez SPZ');
    $('editSubheading').textContent='Zakázka #'+j.id+' · VIN '+(j.vin||'neuvedeno')+' · '+(j.customer||'bez zákazníka');
    $('editBadge').textContent=j.status;
    $('editBadge').className='chip '+(j.status==='Hotovo'||j.status==='Předáno'?'green':j.status==='Rozpracováno'?'blue':j.status.startsWith('Čeká')?'amber':'');
  }
  function openJob(id){
    currentId=id;partIndex=-1;
    const j=current();if(!j){alert('Zakázka nenalezena');return}
    normalizePhotos(j);
    editKeys.forEach(k=>{$('ed_'+k).value=j[k]||''});
    $('ed_status').value=j.status||'Přijato';
    $('editNotice').classList.add('hidden');$('photoNotice').classList.add('hidden');
    refreshHead(j);resetPart();renderParts();renderPhotos();renderHistory();
    setTab('detail');
  }
  window.openJob=openJob;
  const oldTab=setTab;
  setTab=function(tab){
    $('pageDetail').classList.toggle('hidden',tab!=='detail');
    if(tab==='detail'){
      $('pageNew').classList.add('hidden');$('pageJobs').classList.add('hidden');
      $('navNew').classList.remove('active');$('navJobs').classList.add('active');
      window.scrollTo({top:0,behavior:'smooth'});
    }else oldTab(tab);
  };
  $('backToJobs').addEventListener('click',()=>setTab('jobs'));
  const oldRenderJobs=renderJobs;
  renderJobs=function(){
    oldRenderJobs();
    const cards=Array.from(document.querySelectorAll('#jobs .job'));
    cards.forEach((card,index)=>{
      const j=jobs[index],controls=card.querySelector('.controls');
      if(!j||!controls)return;
      const btn=document.createElement('button');
      btn.type='button';btn.className='btn primary';btn.textContent='Otevřít / Upravit';
      btn.addEventListener('click',()=>openJob(j.id));
      controls.prepend(btn);
      const photoCount=(j.photoEntries?.length||0)+(j.photos?.length||0);
      if(photoCount)card.append(textDiv('📷 Fotografie: '+photoCount,'meta'));
      if(j.parts?.length)card.append(textDiv('📦 Díly: '+j.parts.length,'meta'));
    });
  };
  renderJobs();

  $('saveEditedJob').addEventListener('click',()=>{
    const j=current();if(!j)return;
    const values={};editKeys.forEach(k=>values[k]=$('ed_'+k).value.trim());
    values.vin=norm(values.vin);
    if(values.vin&&!validVin(values.vin)){note('editNotice','VIN musí mít 17 platných znaků.','bad');return}
    if(!values.work){note('editNotice','Vyplň popis závady.','bad');return}
    if(values.vin){
      const duplicate=jobs.find(x=>x.id!==j.id&&x.vin===values.vin&&!['Předáno','Zrušeno'].includes(x.status));
      if(duplicate){note('editNotice','Stejné VIN je již na otevřené zakázce #'+duplicate.id+'.','bad');return}
    }
    const previous={...j},before=j.status;
    Object.assign(j,values);j.status=$('ed_status').value;
    if(j.status==='Rozpracováno'&&!j.startedAt)j.startedAt=new Date().toISOString();
    history(j,before===j.status?'Upraveny údaje zakázky':'Změna zakázky a stavu '+before+' → '+j.status);
    if(!persist()){Object.assign(j,previous);return}
    refreshHead(j);renderJobs();renderHistory();
    note('editNotice','✓ Změny byly uloženy.','good');
  });
  function resetPart(){
    partIndex=-1;
    $('partNo').value='';$('partTitle').value='';$('partAmount').value='1';
    $('partUsage').value='Použito';$('partMemo').value='';
    $('commitPart').textContent='＋ Přidat díl';$('cancelPart').classList.add('hidden');
  }
  $('cancelPart').addEventListener('click',resetPart);
  $('commitPart').addEventListener('click',()=>{
    const j=current();if(!j)return;
    const part={number:$('partNo').value.trim(),name:$('partTitle').value.trim(),qty:Number($('partAmount').value),usage:$('partUsage').value,memo:$('partMemo').value.trim()};
    if(!part.number&&!part.name){alert('Vyplň číslo nebo název dílu.');return}
    if(!Number.isFinite(part.qty)||part.qty<=0){alert('Zadej platné množství.');return}
    if(!Array.isArray(j.parts))j.parts=[];
    const previous=j.parts.slice();
    if(partIndex<0)j.parts.push(part);else j.parts[partIndex]=part;
    if(!persist()){j.parts=previous;return}
    history(j,(partIndex<0?'Přidán díl: ':'Upraven díl: ')+(part.number||part.name));persist();
    resetPart();renderParts();renderHistory();renderJobs();
  });
  function renderParts(){
    const root=$('partRows');root.replaceChildren();const j=current();if(!j)return;
    if(!j.parts?.length){root.append(textDiv('Zatím nebyly zapsány žádné díly.','muted'));return}
    j.parts.forEach((p,i)=>{
      const card=document.createElement('div');card.className='partItem';
      const h=document.createElement('strong');h.textContent=p.number||'Bez katalogového čísla';
      card.append(h,textDiv(p.name||'Bez názvu','meta'),textDiv('Množství: '+p.qty+' · '+p.usage+(p.memo?' · '+p.memo:''),'meta'));
      const bar=document.createElement('div');bar.className='buttonbar';
      const edit=document.createElement('button');edit.className='btn secondary';edit.type='button';edit.textContent='Upravit';
      edit.onclick=()=>{partIndex=i;$('partNo').value=p.number||'';$('partTitle').value=p.name||'';$('partAmount').value=p.qty;$('partUsage').value=p.usage||'Použito';$('partMemo').value=p.memo||'';$('commitPart').textContent='✓ Uložit díl';$('cancelPart').classList.remove('hidden');$('partNo').focus()};
      const del=document.createElement('button');del.className='btn secondary';del.type='button';del.textContent='Odebrat';
      del.onclick=()=>{if(!confirm('Odebrat díl?'))return;const old=j.parts.slice();j.parts.splice(i,1);if(!persist()){j.parts=old;return}history(j,'Odebrán díl: '+(p.number||p.name));persist();resetPart();renderParts();renderHistory();renderJobs()};
      bar.append(edit,del);card.append(bar);root.append(card);
    });
  }
  $('addMorePhotos').addEventListener('change',async e=>{
    const j=current();if(!j)return;
    const list=Array.from(e.target.files||[]);e.target.value='';
    const photos=normalizePhotos(j);let added=0;
    for(const file of list){
      if(photos.length>=12)break;
      if(!file.type.startsWith('image/'))continue;
      try{
        const src=await readImage(file,800,.52);
        photos.push({src,kind:$('photoKind').value,memo:$('photoMemo').value.trim(),date:new Date().toISOString()});
        if(!persist()){photos.pop();break}
        added++;
      }catch(err){note('photoNotice','Nahrávání selhalo: '+err.message,'bad')}
    }
    if(added){history(j,'Přidány fotografie ('+added+')');persist();$('photoMemo').value=''}
    note('photoNotice',added?'✓ Uloženo fotografií: '+added:'Fotky se nepodařilo uložit nebo už byl dosažen limit 12.',added?'good':'warn');
    renderPhotos();renderHistory();renderJobs();
  });
  function renderPhotos(){
    const root=$('photoTiles');root.replaceChildren();const j=current();if(!j)return;
    const photos=normalizePhotos(j);
    if(!photos.length){root.append(textDiv('Zatím žádné fotky. Poškození můžeš nafotit kdykoliv.','muted'));return}
    photos.forEach((p,i)=>{
      const tile=document.createElement('div');tile.className='photoTile';
      const img=document.createElement('img');img.src=p.src;img.alt=p.kind||'Fotografie závady';img.loading='lazy';
      img.style.cursor='zoom-in';img.onclick=()=>{$('zoomImage').src=p.src;$('zoomCaption').textContent=(p.kind||'Fotografie')+(p.memo?' · '+p.memo:'');zoom.classList.remove('hidden')};
      const cap=document.createElement('div');cap.className='caption';
      const heading=document.createElement('strong');heading.textContent=p.kind||'Fotografie';
      const description=document.createElement('div');description.textContent=p.memo||'Bez popisku';
      const remove=document.createElement('button');remove.type='button';remove.textContent='Smazat';
      remove.onclick=()=>{if(!confirm('Smazat tuto fotografii?'))return;const old=photos.slice();photos.splice(i,1);if(!persist()){j.photoEntries=old;return}history(j,'Smazána fotografie');persist();renderPhotos();renderHistory();renderJobs()};
      cap.append(heading,description,remove);tile.append(img,cap);root.append(tile);
    });
  }
  function renderHistory(){
    const root=$('jobHistory');root.replaceChildren();const j=current();if(!j)return;
    if(!j.history?.length){root.append(textDiv('Historie se začne ukládat při dalších úpravách.','muted'));return}
    j.history.slice(0,20).forEach(h=>{
      const row=document.createElement('div');row.style.cssText='border-bottom:1px solid #e2e8f0;padding:8px 0;font-size:12px';
      row.textContent=new Date(h.at).toLocaleString('cs-CZ')+' · '+(h.actor||'Mechanik')+' · '+(h.action||h.event||'Úprava');
      root.append(row);
    });
  }
})();
