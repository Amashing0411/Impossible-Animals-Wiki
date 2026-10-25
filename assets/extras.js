function openHelp(){document.getElementById('help-modal').style.display='flex'}
function closeHelp(){document.getElementById('help-modal').style.display='none'}
(function(){
  const tabs=['matchmaker','lab','global','single','planner','biomes','community'];
  document.addEventListener('keydown',e=>{
    const t=e.target.tagName;
    if(e.key==='Escape'){closeHelp();const m=document.getElementById('inv-modal');if(m&&m.style.display!=='none'&&typeof closeInventoryModal==='function')closeInventoryModal();return}
    if(['INPUT','TEXTAREA','SELECT'].includes(t)||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key==='/'){e.preventDefault();const i=document.getElementById('chat-quick-query');if(i){i.focus();i.scrollIntoView({block:'center'})}}
    else if(e.key==='?'){openHelp()}
    else if(/^[1-7]$/.test(e.key)){switchTab(tabs[+e.key-1])}
  });
  const top=document.getElementById('to-top');
  if(top) addEventListener('scroll',()=>top.classList.toggle('show',scrollY>500),{passive:true});
  addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(tabs.includes(h))switchTab(h)});
})();
