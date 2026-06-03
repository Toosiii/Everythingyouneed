// State
let allData=null,vaultData=null,currentTopicId=null,selectedTag=null,selectedGame=null,selectedPriceFilter='all',selectedVaultTag=null,selectedLangFilter=null;

// Asset path — works on GitHub Pages subdirectory and locally
const BASE=location.href.substring(0,location.href.lastIndexOf('/')+1);
const asset=f=>BASE+f;

// Helpers
const $=id=>document.getElementById(id);
const show=id=>{$(id).style.display='block'};
const hide=id=>{$(id).style.display='none'};
function hideAllPanels(){['landingPage','topicContent','vaultContent','vaultCategory','vaultDetail','vaultTool'].forEach(hide);}
function scrollMainTop(){document.querySelector('main').scrollTop=0;}

// Screens
function showApp(){hide('screen-home');show('screen-app');}
function showHome(){hide('screen-app');show('screen-home');}

// Price (single source of truth)
function getPriceType(tags){
    const t=(tags||[]).map(x=>x.toString().toLowerCase());
    const free=t.includes('free');
    const paid=t.some(x=>['premium','paid','subscription','not-free'].includes(x));
    if(free&&paid)return'freemium';if(free)return'free';if(paid)return'paid';return'none';
}
const BSVG={
    free:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M9 12l2 2 4-4"/></svg>',
    paid:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    freemium:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
};
function getPriceBadge(tags){const type=getPriceType(tags);const label={free:'Free',paid:'Paid',freemium:'Freemium'}[type];return label?`<span class="price-badge ${type}">${BSVG[type]}${label}</span>`:''}

// Link card (used by topic view AND search — no duplication)
function makeLinkCard(link,rawSearch){
    const div=document.createElement('div');
    div.className='link-card bg-white dark:bg-gray-800 p-4 rounded-2xl shadow hover:shadow-lg hover:-translate-y-1 transition';
    div.style.cssText='cursor:pointer;padding:1rem;';
    div.onclick=()=>openLinkModal(link);
    const header=document.createElement('div');header.className='flex items-start justify-between gap-2 mb-1';
    const h3=document.createElement('h3');h3.className='font-semibold text-lg leading-tight';h3.innerHTML=highlight(link.title||'',rawSearch);
    const badges=document.createElement('div');badges.style.cssText='display:flex;align-items:center;gap:4px;flex-shrink:0;';
    badges.innerHTML=getPriceBadge(link.tags)+getLangBadge(link.tags);
    header.appendChild(h3);header.appendChild(badges);
    const a=document.createElement('a');a.href=link.url;a.target='_blank';a.className='text-blue-500 text-sm break-all';a.innerHTML=highlight(link.url||'',rawSearch);a.onclick=e=>e.stopPropagation();
    const p=document.createElement('p');p.className='text-gray-600 dark:text-gray-300 text-sm mt-1';p.innerHTML=highlight(link.description||'',rawSearch);
    div.appendChild(header);div.appendChild(a);div.appendChild(p);
    return div;
}
function renderLinks(links,rawSearch){const ll=$('linksList');ll.innerHTML='';links.forEach(l=>ll.appendChild(makeLinkCard(l,rawSearch)));}

// Modal
function openLinkModal(link){
    const domain=(()=>{try{return new URL(link.url).hostname;}catch(e){return'';}})();
    $('modalFavicon').src=`https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    $('modalFavicon').style.display='block';
    $('modalTitle').textContent=link.title||'';$('modalDesc').textContent=link.description||'';$('modalLink').href=link.url||'#';
    $('modalBadge').innerHTML=getPriceBadge(link.tags);
    $('modalTags').innerHTML=(link.tags||[]).map(t=>`<span style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);font-size:0.72rem;padding:2px 9px;border-radius:999px;">${t}</span>`).join('');
    $('linkModal').style.display='flex';document.body.style.overflow='hidden';
}
function closeLinkModal(){$('linkModal').style.display='none';document.body.style.overflow='';}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLinkModal();});

// Search highlight
function highlight(text,raw){
    if(!raw)return text;
    return raw.split(/\s+/).filter(Boolean).reduce((r,t)=>{
        try{return r.replace(new RegExp('('+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'),'<span class="match-highlight">$1</span>');}catch(e){return r;}
    },text);
}

// Language filter + badge
function setLangFilter(lang){
    selectedLangFilter=lang;
    ['lang-all','lang-EN','lang-DE','lang-Multi'].forEach(id=>{$(id)?.classList.remove('active');});
    $(lang?'lang-'+lang:'lang-all')?.classList.add('active');
    filterLinks();
}
const LANG_META={EN:{f:'🇬🇧'},DE:{f:'🇩🇪'},Multi:{f:'🌍'},FR:{f:'🇫🇷'},JP:{f:'🇯🇵'},RU:{f:'🇷🇺'},ZH:{f:'🇨🇳'},KO:{f:'🇰🇷'}};
function getLangBadge(tags){
    const t=(tags||[]).map(x=>x.toString());
    const k=Object.keys(LANG_META).find(k=>t.includes(k));
    return k?`<span class="lang-badge">${LANG_META[k].f} ${k}</span>`:'';
}

// Price filter
function setPriceFilter(type){
    selectedPriceFilter=type;
    ['all','free','paid','freemium'].forEach(t=>$('filter-'+t)?.classList.toggle('active',t===type));
    filterLinks();
}

// Filter / search
function filterLinks(){
    const rawSearch=$('searchInput').value.trim();
    const search=rawSearch.toLowerCase();
    $('searchClearBtn').style.display=rawSearch?'block':'none';
    if(!search){
        const current=allData?.topics?.find(t=>t.id===currentTopicId);
        if(!current)return;
        let links=current.links||[];
        if(selectedTag)links=links.filter(l=>l.tags?.includes(selectedTag));
        if(selectedGame&&currentTopicId==='Games')links=links.filter(l=>l.game===selectedGame);
        if(selectedPriceFilter!=='all')links=links.filter(l=>getPriceType(l.tags)===selectedPriceFilter);
        if(selectedLangFilter)links=links.filter(l=>(l.tags||[]).map(t=>t.toString()).includes(selectedLangFilter));
        $('resultsCount').textContent=`${links.length} result${links.length!==1?'s':''}`;
        renderLinks(links,'');return;
    }
    const terms=search.split(/\s+/).filter(Boolean);
    show('topicContent');hide('landingPage');
    $('topicTitle').textContent=`Search: "${rawSearch}"`;
    const ll=$('linksList');ll.innerHTML='';
    let total=0;
    allData.topics.forEach(topic=>{
        let links=(topic.links||[]).filter(l=>{const hay=[l.title,l.description,l.url,(l.tags||[]).join(' '),l.game||''].join(' ').toLowerCase();return terms.every(t=>hay.includes(t));});
        if(selectedPriceFilter!=='all')links=links.filter(l=>getPriceType(l.tags)===selectedPriceFilter);
        if(selectedLangFilter)links=links.filter(l=>(l.tags||[]).map(t=>t.toString()).includes(selectedLangFilter));
        if(!links.length)return;
        total+=links.length;
        const heading=document.createElement('div');
        heading.style.cssText='margin:1.5rem 0 0.6rem;padding-bottom:0.4rem;border-bottom:1px solid rgba(255,255,255,0.1);';
        heading.innerHTML=`<span style="font-size:1rem;font-weight:700;opacity:0.85;">${topic.name}</span> <span style="font-size:0.8rem;opacity:0.45;">${links.length} result${links.length!==1?'s':''}</span>`;
        ll.appendChild(heading);
        const grid=document.createElement('div');grid.className='grid grid-cols-1 md:grid-cols-3 gap-4';
        links.forEach(link=>grid.appendChild(makeLinkCard(link,rawSearch)));
        ll.appendChild(grid);
    });
    $('resultsCount').textContent=total?`${total} result${total!==1?'s':''} across all topics`:'No results found';
}

function clearSearch(){
    $('searchInput').value='';$('searchClearBtn').style.display='none';
    if(currentTopicId){const c=allData?.topics?.find(t=>t.id===currentTopicId);if(c)$('topicTitle').textContent=c.name;filterLinks();}
}

// Topics
function selectTopic(topicId){
    hideAllPanels();
    if(!topicId){show('landingPage');return;}
    currentTopicId=topicId;selectedTag=null;selectedGame=null;
    $('searchInput').value='';$('topicsDropdown').value=topicId;
    const current=allData?.topics?.find(t=>t.id===topicId);if(!current)return;
    show('topicContent');$('topicTitle').textContent=current.name;
    const gs=$('gamesCategory');
    if(topicId==='Games'){gs.style.display='block';renderGameCategories(current);}else gs.style.display='none';
    renderTags(current);filterLinks();
}
function renderTags(topic){
    const tl=$('tagsList');tl.innerHTML='';const allTags={};
    topic.links?.forEach(l=>l.tags?.forEach(t=>allTags[t]=true));
    Object.keys(allTags).forEach(tag=>{
        const a=document.createElement('a');a.href='#';a.textContent=tag;
        a.className='px-2 py-1 bg-gray-300 dark:bg-gray-700 rounded text-sm cursor-pointer hover:bg-gray-400';
        a.onclick=e=>{e.preventDefault();selectedTag=selectedTag===tag?null:tag;filterLinks();};
        tl.appendChild(a);
    });
}
function renderGameCategories(topic){
    const gl=$('gamesList');gl.innerHTML='';const games=new Set();
    topic.links?.forEach(l=>{if(l.game)games.add(l.game);});
    games.forEach(game=>{
        const a=document.createElement('a');a.href='#';a.textContent=game;
        a.className='px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-sm';
        a.onclick=e=>{e.preventDefault();selectedGame=selectedGame===game?null:game;filterLinks();};
        gl.appendChild(a);
    });
}

// Vault
function showVault(){hideAllPanels();show('vaultContent');$('topicsDropdown').value='';currentTopicId=null;selectedVaultTag=null;if(vaultData)renderVault();else loadVault();}
async function loadVault(){
    try{const res=await fetch(asset('vault.yaml'));if(!res.ok)throw new Error();vaultData=jsyaml.load(await res.text());renderVault();}
    catch(e){$('vaultList').innerHTML='<p style="color:rgba(255,255,255,0.4);font-size:0.9rem;">vault.yaml not found.</p>';}
}
function renderVault(){
    const allTags={};vaultData.entries?.forEach(e=>e.tags?.forEach(t=>allTags[t]=true));
    const tagsEl=$('vaultTagsList');tagsEl.innerHTML='';
    [null,...Object.keys(allTags).sort()].forEach(tag=>{
        const btn=document.createElement('button');
        btn.className='vault-tag-btn'+((!tag&&!selectedVaultTag)||tag===selectedVaultTag?' active':'');
        btn.textContent=tag||'All';btn.onclick=()=>{selectedVaultTag=tag;renderVault();};tagsEl.appendChild(btn);
    });
    let entries=vaultData.entries||[];
    if(selectedVaultTag)entries=entries.filter(e=>e.tags?.includes(selectedVaultTag));
    const list=$('vaultList');list.innerHTML='';
    entries.forEach(entry=>{
        const card=document.createElement('div');card.className='vault-card-compact';
        card.onclick=()=>entry.type==='category'?openVaultCategory(entry):entry.type==='tool'?openVaultTool(entry):openVaultDetail(entry);
        if(entry.image){const img=document.createElement('img');img.src=entry.image;img.alt=entry.title||'';img.className='vault-card-img';img.onerror=()=>img.style.display='none';card.appendChild(img);}
        else{const ph=document.createElement('div');ph.className='vault-card-img vault-card-img-placeholder';ph.textContent=(entry.title||'').match(/./u)?.[0]||'\u{1F4C4}';card.appendChild(ph);}
        const info=document.createElement('div');info.className='vault-card-info';
        const title=document.createElement('div');title.className='vault-card-title';title.textContent=entry.title||'';info.appendChild(title);
        if(entry.tags?.length){const row=document.createElement('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.4rem;';entry.tags.slice(0,2).forEach(t=>{const pill=document.createElement('span');pill.style.cssText='background:rgba(124,58,237,0.2);color:#c4b5fd;font-size:0.65rem;padding:1px 7px;border-radius:999px;border:1px solid rgba(124,58,237,0.3);white-space:nowrap;';pill.textContent=t;row.appendChild(pill);});info.appendChild(row);}
        if(entry.type==='category'||entry.type==='tool'){
            const hint=document.createElement('div');
            hint.style.cssText='margin-top:0.5rem;font-size:0.7rem;color:#c4b5fd;display:flex;align-items:center;gap:0.25rem;font-weight:600;';
            hint.innerHTML=(entry.type==='tool'?'\u25b6 Starten':'\u00d6ffnen')+' <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/></svg>';
            info.appendChild(hint);
        }
        card.appendChild(info);list.appendChild(card);
    });
}

// Vault category
function extractEmoji(s){return(s||'').match(/^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/)?.[1]||null;}
function openVaultCategory(entry){
    hideAllPanels();show('vaultCategory');scrollMainTop();
    const em=extractEmoji(entry.title||'');
    $('vcIcon').textContent=em||'';$('vcTitle').textContent=em?(entry.title||'').replace(em,'').trim():(entry.title||'');$('vcDesc').textContent=entry.description||'';
    const tabsEl=$('vcTabs');tabsEl.innerHTML='';
    if(entry.tabs?.length){entry.tabs.forEach((tab,i)=>{const btn=document.createElement('button');btn.className='vc-tab-btn'+(i===0?' active':'');btn.textContent=tab.name;btn.onclick=()=>{tabsEl.querySelectorAll('.vc-tab-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderSubjectGrid(tab.subjects);};tabsEl.appendChild(btn);});renderSubjectGrid(entry.tabs[0].subjects);}
    else renderSubjectGrid(entry.subjects||[]);
}
function renderSubjectGrid(subjects){
    const grid=$('vcSubjects');grid.innerHTML='';
    subjects.forEach(sub=>{
        const card=document.createElement('div');card.className='vault-card-compact subject-card';card.onclick=()=>openVaultSubject(sub);

        // Extract emoji once, reuse everywhere
        const em=extractEmoji(sub.title||'');
        const cleanTitle=em?(sub.title||'').replace(em,'').trim():(sub.title||'');

        // Image or emoji placeholder
        if(sub.image){
            const img=document.createElement('img');img.src=sub.image;img.alt=cleanTitle;
            img.className='vault-card-img subject-card-img';img.onerror=()=>img.style.display='none';card.appendChild(img);
        } else {
            const ph=document.createElement('div');ph.className='vault-card-img subject-card-img vault-card-img-placeholder';
            ph.textContent=em||'\u{1F4C4}';ph.style.fontSize='3rem';card.appendChild(ph);
        }

        const info=document.createElement('div');info.className='vault-card-info subject-card-info';
        const title=document.createElement('div');title.className='subject-card-title';
        title.textContent=cleanTitle;info.appendChild(title);

        // Emoji badge over image
        if(em){const badge=document.createElement('div');badge.style.cssText='font-size:1.4rem;position:absolute;top:0.6rem;left:0.75rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6));';badge.textContent=em;card.appendChild(badge);}

        // Stats row
        const stats=document.createElement('div');stats.style.cssText='display:flex;gap:0.6rem;margin-top:0.6rem;flex-wrap:wrap;';
        if(sub.steps?.length){const s=document.createElement('span');s.style.cssText='font-size:0.72rem;color:rgba(255,255,255,0.35);background:rgba(255,255,255,0.06);border-radius:999px;padding:2px 9px;';s.textContent=sub.steps.length+' Schritte';stats.appendChild(s);}
        if(sub.links?.length){const l=document.createElement('span');l.style.cssText='font-size:0.72rem;color:rgba(255,255,255,0.35);background:rgba(255,255,255,0.06);border-radius:999px;padding:2px 9px;';l.textContent=sub.links.length+' Links';stats.appendChild(l);}
        info.appendChild(stats);

        card.appendChild(info);grid.appendChild(card);
    });
}
function openVaultSubject(sub){hide('vaultCategory');openVaultDetail(sub);$('vaultDetailBack').onclick=()=>{hide('vaultDetail');show('vaultCategory');scrollMainTop();};}
function closeVaultCategory(){hide('vaultCategory');show('vaultContent');scrollMainTop();}

// Vault detail
function openVaultDetail(entry){
    hideAllPanels();show('vaultDetail');scrollMainTop();
    $('vaultDetailBack').onclick=closeVaultDetail;
    const imgWrap=$('vdImage'),imgEl=$('vdImageEl');
    if(entry.image){imgEl.src=entry.image;imgEl.alt=entry.title||'';imgWrap.style.display='block';}else imgWrap.style.display='none';
    $('vdTitle').textContent=entry.title||'';
    $('vdTags').innerHTML=(entry.tags||[]).map(t=>`<span style="background:rgba(124,58,237,0.18);color:#c4b5fd;font-size:0.75rem;padding:3px 11px;border-radius:999px;border:1px solid rgba(124,58,237,0.35);">${t}</span>`).join('');
    $('vdDesc').textContent=entry.description||'';
    const sw=$('vdStepsWrap'),se=$('vdSteps');
    if(entry.steps?.length){se.innerHTML='';entry.steps.forEach((step,i)=>{const row=document.createElement('div');row.style.cssText='display:flex;gap:1rem;align-items:flex-start;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:0.85rem 1.1rem;';const num=document.createElement('span');num.style.cssText='min-width:26px;height:26px;border-radius:50%;background:rgba(124,58,237,0.3);border:1px solid rgba(124,58,237,0.5);display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;color:#c4b5fd;flex-shrink:0;margin-top:1px;';num.textContent=i+1;const txt=document.createElement('span');txt.style.cssText='font-size:0.9rem;color:rgba(255,255,255,0.72);line-height:1.6;';txt.textContent=step;row.appendChild(num);row.appendChild(txt);se.appendChild(row);});sw.style.display='block';}else sw.style.display='none';
    const lw=$('vdLinksWrap'),le=$('vdLinks');
    if(entry.links?.length){le.innerHTML='';entry.links.forEach(l=>{const a=document.createElement('a');a.href=l.url;a.target='_blank';a.style.cssText='display:inline-flex;align-items:center;gap:0.5rem;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:0.65rem 1.1rem;font-size:0.85rem;font-weight:600;color:rgba(255,255,255,0.75);text-decoration:none;transition:all 0.2s;';a.onmouseover=()=>{a.style.background='rgba(124,58,237,0.25)';a.style.borderColor='rgba(124,58,237,0.45)';a.style.color='#c4b5fd';};a.onmouseout=()=>{a.style.background='rgba(255,255,255,0.07)';a.style.borderColor='rgba(255,255,255,0.12)';a.style.color='rgba(255,255,255,0.75)';};a.innerHTML=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>${l.title||l.url}`;le.appendChild(a);});lw.style.display='block';}else lw.style.display='none';
}
function openVaultTool(entry){
    hideAllPanels();
    const panel=$('vaultTool');
    panel.style.display='flex';
    $('vaultToolFrame').src=entry.tool_src?asset(entry.tool_src):'';
    scrollMainTop();
}
function closeVaultTool(){
    $('vaultToolFrame').src='';
    hide('vaultTool');
    show('vaultContent');
    scrollMainTop();
}
function closeVaultDetail(){hide('vaultDetail');show('vaultContent');scrollMainTop();}

// Sidebar
function toggleSidebar(){const sb=$('sidebar'),ov=$('sidebarOverlay');const open=sb.style.transform==='translateX(0px)'||sb.style.transform==='translateX(0%)';sb.style.transform=open?'translateX(-100%)':'translateX(0%)';ov.style.display=open?'none':'block';}
function closeSidebar(){if(window.innerWidth>=640)return;$('sidebar').style.transform='translateX(-100%)';$('sidebarOverlay').style.display='none';}
function applyDesktopSidebar(){const sb=$('sidebar');if(window.innerWidth>=640){sb.style.transform='translateX(0%)';sb.style.position='sticky';sb.style.top='0';sb.style.height='calc(100vh - 65px)';}else{sb.style.transform='translateX(-100%)';sb.style.position='fixed';sb.style.top='65px';sb.style.height='';$('sidebarOverlay').style.display='none';}}
window.addEventListener('resize',applyDesktopSidebar);

// Data loading
async function loadData(){
    try{
        const res=await fetch(asset('data.yaml'));if(!res.ok)throw new Error('HTTP '+res.status);
        allData=jsyaml.load(await res.text());
        const total=allData.topics?.reduce((s,t)=>s+(t.links?.length||0),0)||0;
        $('heroLinksNum').textContent=total;$('heroTopicsNum').textContent=allData.topics?.length||0;
        $('totalLinks').textContent=total;$('statTopicsNum').textContent=allData.topics?.length||0;
        const sel=$('topicsDropdown');sel.innerHTML='<option value="">Select a topic...</option>';
        allData.topics?.forEach(t=>{const o=document.createElement('option');o.value=t.id;o.textContent=t.name;sel.appendChild(o);});
        // Single-page app — no URL param routing needed
    }catch(err){document.body.innerHTML='<div style="padding:2rem;color:red;">\u26a0\ufe0f data.yaml konnte nicht geladen werden.</div>';}
}

// Init
document.documentElement.classList.add('dark');
$('footer-year').textContent=new Date().getFullYear();
$('footer-date').textContent=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
window.addEventListener('DOMContentLoaded',()=>{applyDesktopSidebar();loadData();});
// Expose functions to global scope for HTML onclick handlers
window.showApp           = showApp;
window.showHome          = showHome;
window.showVault         = showVault;
window.selectTopic       = selectTopic;
window.filterLinks       = filterLinks;
window.clearSearch       = clearSearch;
window.setPriceFilter    = setPriceFilter;
window.setLangFilter     = setLangFilter;
window.toggleSidebar     = toggleSidebar;
window.closeSidebar      = closeSidebar;
window.openLinkModal     = openLinkModal;
window.closeLinkModal    = closeLinkModal;
window.openVaultCategory = openVaultCategory;
window.openVaultDetail   = openVaultDetail;
window.openVaultTool     = openVaultTool;
window.closeVaultDetail  = closeVaultDetail;
window.closeVaultCategory= closeVaultCategory;
window.closeVaultTool    = closeVaultTool;
window.openVaultSubject  = openVaultSubject;