(function(){
  const KEY='rayy_assistant_v8';
  const $=id=>document.getElementById(id);
  const get=()=>JSON.parse(localStorage.getItem(KEY)||'{}');
  const set=d=>localStorage.setItem(KEY,JSON.stringify(d));
  const mins=t=>{const [h,m]=String(t||'0:0').split(':').map(Number);return h*60+m};
  const isOvernight=(s,e)=>mins(e)<=mins(s);
  const toast=s=>{if($('toast')){$('toast').textContent=s;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',2200)}};
  const mark=document.querySelector('.brandMark');
  if(mark){mark.innerHTML='<img src="icon.png" alt="Rayy" class="brandLogo">';mark.setAttribute('aria-label','Rayy');}
  const st=document.createElement('style');st.textContent='.brandMark{padding:0!important;overflow:hidden!important}.brandLogo{display:block;width:100%;height:100%;object-fit:cover;border-radius:inherit}';document.head.appendChild(st);
  function bind(){
    const oldCore=window.openCore,oldEvent=window.openEvent;
    if(oldCore&&!oldCore.__wrapped){const wrapped=function(c,s){window.__rayyCoreId=c?.id||null;return oldCore(c,s)};wrapped.__wrapped=true;window.openCore=wrapped;}
    if(oldEvent&&!oldEvent.__wrapped){const wrapped=function(e,s){window.__rayyEventId=e?.id||null;return oldEvent(e,s)};wrapped.__wrapped=true;window.openEvent=wrapped;}
    if($('saveCore'))$('saveCore').onclick=saveCore;
    if($('saveEvent'))$('saveEvent').onclick=saveEvent;
  }
  function saveCore(){
    const d=get(),id=window.__rayyCoreId||null,title=$('coreTitle').value.trim(),startDate=$('coreStartDate').value,endDate=$('coreEndDate').value,start=$('coreStart').value,end=$('coreEnd').value;
    if(!title||!startDate||!endDate||!start||!end)return toast('Add a name, dates, and start/end time.');
    if(endDate<startDate)return toast('To date must be on or after From date.');
    const days=[...$('coreDays').querySelectorAll('.on')].map(b=>+b.dataset.day);
    if($('coreRepeat').value==='weekly'&&!days.length)return toast('Choose at least one day.');
    const c={id:id||crypto.randomUUID(),title,startDate,endDate,start,end,repeat:$('coreRepeat').value,days,category:$('coreCategory').value,location:$('coreLocation').value.trim(),notes:$('coreNotes').value.trim(),overnight:isOvernight(start,end)};
    const i=(d.core||[]).findIndex(x=>x.id===c.id);if(i>=0)d.core[i]=c;else(d.core||(d.core=[])).push(c);set(d);$('coreModal').classList.remove('open');toast(c.overnight?'Overnight core schedule saved.':'Core schedule saved.');setTimeout(()=>location.reload(),80);
  }
  function saveEvent(){
    const d=get(),id=window.__rayyEventId||null,title=$('eventTitle').value.trim(),date=$('eventDate').value,start=$('eventStart').value,end=$('eventEnd').value;
    if(!title||!date||!start||!end)return toast('Add a title, date, start and end time.');
    const e={id:id||crypto.randomUUID(),title,date,start,end,category:$('eventCategory').value,repeat:$('eventRepeat').value,location:$('eventLocation').value.trim(),notes:$('eventNotes').value.trim(),overnight:isOvernight(start,end)};
    const i=(d.events||[]).findIndex(x=>x.id===e.id);if(i>=0)d.events[i]=e;else(d.events||(d.events=[])).push(e);set(d);$('eventModal').classList.remove('open');toast(e.overnight?'Overnight event saved.':'Calendar event saved.');setTimeout(()=>location.reload(),80);
  }
  function fixOvernightBlocks(){
    const grid=$('weekGrid');if(!grid)return;const cols=[...grid.querySelectorAll('.dayColumn')];
    cols.forEach((col,i)=>[...col.querySelectorAll('.scheduleBlock:not([data-overnight-clone])')].forEach(b=>{
      const t=b.querySelector('.blockTime')?.textContent||'';const m=t.match(/(\d{1,2}:\d{2})[–-](\d{1,2}:\d{2})/);if(!m||mins(m[2])>mins(m[1]))return;
      b.style.height=Math.max(28,((1440-mins(m[1]))/30)*30-3)+'px';
      if(i<cols.length-1&&!b.nextElementSibling?.dataset?.overnightClone){const c=b.cloneNode(true);c.dataset.overnightClone='1';c.style.top='0px';c.style.height=Math.max(28,(mins(m[2])/30)*30-3)+'px';c.querySelector('.blockTime').textContent='12:00 AM–'+m[2];c.onclick=null;cols[i+1].appendChild(c);}
    }));
  }
  new MutationObserver(fixOvernightBlocks).observe(document.body,{childList:true,subtree:true});
  bind();setTimeout(bind,50);setTimeout(fixOvernightBlocks,120);
})();
