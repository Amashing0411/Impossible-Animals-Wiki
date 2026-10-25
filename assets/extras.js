function openHelp(){document.getElementById('help-modal').style.display='flex'}
function closeHelp(){document.getElementById('help-modal').style.display='none'}
(function(){
  const tabs=['matchmaker','lab','global','single','planner','biomes'];
  document.addEventListener('keydown',e=>{
    const t=e.target.tagName;
    if(e.key==='Escape'){
      closeHelp();
      const m=document.getElementById('inv-modal');
      if(m&&m.style.display!=='none'&&typeof closeInventoryModal==='function')closeInventoryModal();
      const cd=document.getElementById('community-drawer');
      if(cd&&cd.style.display!=='none'&&typeof toggleCommunityWidget==='function')toggleCommunityWidget(false);
      return;
    }
    if(['INPUT','TEXTAREA','SELECT'].includes(t)||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key==='/'){e.preventDefault();const i=document.getElementById('chat-quick-query');if(i){i.focus();i.scrollIntoView({block:'center'})}}
    else if(e.key==='?'){openHelp()}
    else if(e.key==='c'||e.key==='C'){if(typeof toggleCommunityWidget==='function')toggleCommunityWidget()}
    else if(/^[1-6]$/.test(e.key)){switchTab(tabs[+e.key-1])}
  });
  const top=document.getElementById('to-top');
  if(top) addEventListener('scroll',()=>top.classList.toggle('show',scrollY>500),{passive:true});
  addEventListener('hashchange',()=>{
    const h=location.hash.slice(1);
    if(h==='community'&&typeof toggleCommunityWidget==='function'){
      toggleCommunityWidget(true);
    } else if(tabs.includes(h)){
      switchTab(h);
    }
  });
})();
