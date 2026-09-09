(function(){
  const KEY='rayy_assistant_v8';
  const SUPA_URL='https://djiihzmxztmxayiclies.supabase.co';
  const SUPA_KEY='sb_publishable_hXOfIFpWfVhkYAvR--s6hw_M7bhPgk4';
  const $=id=>document.getElementById(id);
  const get=()=>JSON.parse(localStorage.getItem(KEY)||'{}');
  const rawSet=localStorage.setItem.bind(localStorage);
  let syncing=false,supa=null,syncTimer=null,channel=null;
  const mins=t=>{const [h,m]=String(t||'0:0').split(':').map(Number);return h*60+m};
  const isOvernight=(s,e)=>mins(e)<=mins(s);
  const toast=s=>{if($('toast')){$('toast').textContent=s;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',2400)}};
  const mark=document.querySelector('.brandMark');
  if(mark){mark.innerHTML='<img src="icon.png" alt="Rayy" class="brandLogo">';mark.setAttribute('aria-label','Rayy');}
  const st=document.createElement('style');st.textContent=`
    .brandMark{padding:0!important;overflow:hidden!important}.brandLogo{display:block;width:100%;height:100%;object-fit:cover;border-radius:inherit}
    .scheduleScroll{overflow:auto!important;max-height:72vh!important;height:72vh!important;overscroll-behavior:contain!important;scroll-behavior:auto!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-x pan-y!important}
    .weekGrid{will-change:auto!important}
    @media(max-width:700px){.scheduleScroll{height:58vh!important;max-height:58vh!important;border-radius:0 0 16px 16px}.weekGrid{min-width:980px!important}.dayHeader{position:sticky!important;top:0!important}.timeCol{position:sticky!important;left:0!important;z-index:3!important}}
    .authBox{padding:14px;border:1px solid #244966;background:#08172a;border-radius:14px;margin:12px 0}.authBox h3{margin:0 0 5px}.authBox p{font-size:11px;color:#89a3bd;margin:4px 0 10px}.authRow{display:grid;grid-template-columns:1fr 1fr;gap:7px}.authBox input{width:100%;padding:10px;border-radius:9px;border:1px solid #28445f;background:#0d2139;color:inherit}.authActions{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.authActions button{border:0;border-radius:9px;padding:9px 12px;font-weight:850;background:#168cff;color:#fff}.authActions button.secondaryAuth{background:#142a43;color:#d8eafa}.authStatus{font-size:10px;color:#82c8ff;margin-top:7px}
  `;document.head.appendChild(st);
  function bind(){
    const oldCore=window.openCore,oldEvent=window.openEvent;
    if(oldCore&&!oldCore.__wrappedV10){const wrapped=function(c,s){window.__rayyCoreId=c?.id||null;return oldCore(c,s)};wrapped.__wrappedV10=true;window.openCore=wrapped;}
    if(oldEvent&&!oldEvent.__wrappedV10){const wrapped=function(e,s){window.__rayyEventId=e?.id||null;return oldEvent(e,s)};wrapped.__wrappedV10=true;window.openEvent=wrapped;}
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
    d.core=d.core||[];const i=d.core.findIndex(x=>x.id===c.id);if(i>=0)d.core[i]=c;else d.core.push(c);rawSet(KEY,JSON.stringify(d));$('coreModal').classList.remove('open');toast(c.overnight?'Overnight core schedule saved.':'Core schedule saved.');setTimeout(()=>location.reload(),120);
  }
  function saveEvent(){
    const d=get(),id=window.__rayyEventId||null,title=$('eventTitle').value.trim(),date=$('eventDate').value,start=$('eventStart').value,end=$('eventEnd').value;
    if(!title||!date||!start||!end)return toast('Add a title, date, start and end time.');
    const e={id:id||crypto.randomUUID(),title,date,start,end,category:$('eventCategory').value,repeat:$('eventRepeat').value,location:$('eventLocation').value.trim(),notes:$('eventNotes').value.trim(),overnight:isOvernight(start,end)};
    d.events=d.events||[];const i=d.events.findIndex(x=>x.id===e.id);if(i>=0)d.events[i]=e;else d.events.push(e);rawSet(KEY,JSON.stringify(d));$('eventModal').classList.remove('open');toast(e.overnight?'Overnight event saved.':'Calendar event saved.');setTimeout(()=>location.reload(),120);
  }
  function fixOvernightBlocks(){
    const grid=$('weekGrid');if(!grid)return;const cols=[...grid.querySelectorAll('.dayColumn')];
    cols.forEach((col,i)=>[...col.querySelectorAll('.scheduleBlock:not([data-overnight-clone])')].forEach(b=>{
      const t=b.querySelector('.blockTime')?.textContent||'';const m=t.match(/(\d{1,2}:\d{2})[–-](\d{1,2}:\d{2})/);if(!m||mins(m[2])>mins(m[1]))return;
      b.style.height=Math.max(28,((1440-mins(m[1]))/30)*30-3)+'px';
      if(i<cols.length-1&&!cols[i+1].querySelector('[data-overnight-clone="1"]')){const c=b.cloneNode(true);c.dataset.overnightClone='1';c.style.top='0px';c.style.height=Math.max(28,(mins(m[2])/30)*30-3)+'px';c.removeAttribute('onclick');cols[i+1].appendChild(c);}
    }));
  }
  new MutationObserver(fixOvernightBlocks).observe(document.body,{childList:true,subtree:true});
  const addCore=$('addCore');if(addCore)addCore.addEventListener('click',()=>setTimeout(()=>{window.__rayyCoreId=null;bind()},0));
  const addEvent=$('addEvent');if(addEvent)addEvent.addEventListener('click',()=>setTimeout(()=>{window.__rayyEventId=null;bind()},0));

  const originalRenderWeek=window.renderWeek;
  const weekAnchorKey='rayy_week_anchor';
  function anchorDate(){const s=localStorage.getItem(weekAnchorKey);return s?new Date(s+'T12:00:00'):new Date()}
  function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function setAnchor(d){localStorage.setItem(weekAnchorKey,iso(d));}
  function rotateWeekToAnchor(){
    const grid=$('weekGrid');if(!grid)return;
    const headers=[...grid.querySelectorAll('.dayHeader')],cols=[...grid.querySelectorAll('.dayColumn')];
    if(headers.length!==7||cols.length!==7)return;
    const a=anchorDate(),dow=a.getDay(),offset=dow===0?6:dow-1;
    const order=[...Array(7)].map((_,i)=>(offset+i)%7);
    const time=grid.querySelector('.timeCol');
    order.forEach(i=>grid.appendChild(headers[i]));grid.appendChild(time);order.forEach(i=>grid.appendChild(cols[i]));
    const end=new Date(a);end.setDate(end.getDate()+6);
    const f=d=>new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(d);
    if($('weekRange'))$('weekRange').textContent=`${f(a)} – ${f(end)}`;
    fixOvernightBlocks();
  }
  const prev=$('prevWeek'),next=$('nextWeek'),today=$('todayJump');
  const oldPrev=prev?.onclick,oldNext=next?.onclick;
  if(prev)prev.onclick=()=>{if(oldPrev)oldPrev();let d=anchorDate();d.setDate(d.getDate()-7);setAnchor(d);setTimeout(rotateWeekToAnchor,0)};
  if(next)next.onclick=()=>{if(oldNext)oldNext();let d=anchorDate();d.setDate(d.getDate()+7);setAnchor(d);setTimeout(rotateWeekToAnchor,0)};
  if(today)today.onclick=()=>{setAnchor(new Date());if(typeof originalRenderWeek==='function')originalRenderWeek();setTimeout(rotateWeekToAnchor,0);window.scrollTo({top:0,behavior:'smooth'})};
  if(typeof originalRenderWeek==='function')setTimeout(()=>{originalRenderWeek();rotateWeekToAnchor()},40);

  function loadSupabase(){
    if(window.supabase)return;
    const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=()=>{};s.onerror=()=>console.warn('Rayy: Supabase client failed to load');document.head.appendChild(s);
  }
  function injectAuthUI(){
    const settings=$('settingsModal');if(!settings||document.getElementById('rayyCloudBox'))return;
    const sheet=settings.querySelector('.sheet');if(!sheet)return;
    const box=document.createElement('div');box.id='rayyCloudBox';box.className='authBox';box.innerHTML=`<h3>☁️ Rayy Cloud Sync</h3><p>Use the same Rayy account on your phone and computer so your schedule stays in sync.</p><div class="authRow"><input id="rayyEmail" type="email" placeholder="Email"><input id="rayyPassword" type="password" placeholder="Password"></div><div class="authActions"><button id="rayySignIn">Sign in</button><button id="rayySignUp" class="secondaryAuth">Create account</button><button id="rayySignOut" class="secondaryAuth" style="display:none">Sign out</button></div><div id="rayyAuthStatus" class="authStatus">Not connected</div>`;
    sheet.insertBefore(box,sheet.firstChild);
    $('rayySignIn').onclick=async()=>{const {error}=await supa.auth.signInWithPassword({email:$('rayyEmail').value.trim(),password:$('rayyPassword').value});if(error)return authStatus(error.message);authStatus('Signed in. Syncing…')};
    $('rayySignUp').onclick=async()=>{const email=$('rayyEmail').value.trim(),password=$('rayyPassword').value;if(!email||password.length<6)return authStatus('Use an email and a password of at least 6 characters.');const {error}=await supa.auth.signUp({email,password});if(error)return authStatus(error.message);authStatus('Account created. Check your email if confirmation is required.')};
    $('rayySignOut').onclick=async()=>{await supa.auth.signOut();authStatus('Signed out')};
  }
  function authStatus(t){const x=$('rayyAuthStatus');if(x)x.textContent=t}
  async function startCloud(namespace){
    if(!namespace||supa)return;
    supa=namespace.createClient(SUPA_URL,SUPA_KEY);
    injectAuthUI();
    const {data:sessionData}=await supa.auth.getSession();await onSession(sessionData?.session||null);
    supa.auth.onAuthStateChange((_e,session)=>setTimeout(()=>onSession(session),0));
  }
  async function onSession(session){
    if(!session){if($('rayyAuthStatus'))authStatus('Not connected — local data is still available on this device.');return;}
    injectAuthUI();$('rayySignIn')?.setAttribute('style','display:none');$('rayySignUp')?.setAttribute('style','display:none');$('rayySignOut')?.setAttribute('style','');
    authStatus(`Connected as ${session.user.email||'Rayy user'}`);
    await syncInitial(session.user.id);subscribe(session.user.id);
  }
  async function syncInitial(uid){
    const {data:row,error}=await supa.from('rayy_user_data').select('data,updated_at').eq('user_id',uid).maybeSingle();
    if(error){authStatus('Sync error: '+error.message);return;}
    const local=get();
    if(!row){local._syncUpdatedAt=new Date().toISOString();rawSet(KEY,JSON.stringify(local));await supa.from('rayy_user_data').upsert({user_id:uid,data:local,updated_at:local._syncUpdatedAt});authStatus('Connected · this device uploaded its data');return;}
    const cloudTime=new Date(row.updated_at||0).getTime(),localTime=new Date(local._syncUpdatedAt||0).getTime();
    if(localTime>cloudTime){await supa.from('rayy_user_data').upsert({user_id:uid,data:local,updated_at:local._syncUpdatedAt});authStatus('Connected · latest device data uploaded');}
    else{syncing=true;rawSet(KEY,JSON.stringify(row.data||{}));syncing=false;try{Object.assign(window.data,row.data||{});window.render?.();}catch(e){}authStatus('Connected · synced from cloud');}
  }
  function subscribe(uid){
    if(channel)supa.removeChannel(channel);
    channel=supa.channel('rayy-sync-'+uid).on('postgres_changes',{event:'*',schema:'public',table:'rayy_user_data',filter:'user_id=eq.'+uid},payload=>{const incoming=payload.new?.data;if(!incoming)return;syncing=true;rawSet(KEY,JSON.stringify(incoming));syncing=false;try{Object.assign(window.data,incoming);window.render?.();}catch(e){}authStatus('Synced just now');}).subscribe();
  }
  async function pushCloud(){
    if(!supa||syncing)return;const {data:sd}=await supa.auth.getSession();const uid=sd?.session?.user?.id;if(!uid)return;const d=get();d._syncUpdatedAt=new Date().toISOString();rawSet(KEY,JSON.stringify(d));await supa.from('rayy_user_data').upsert({user_id:uid,data:d,updated_at:d._syncUpdatedAt});
  }
  const originalSet=localStorage.setItem.bind(localStorage);
  localStorage.setItem=function(k,v){originalSet(k,v);if(k===KEY&&!syncing){clearTimeout(syncTimer);syncTimer=setTimeout(pushCloud,500)}};

  async function ensureNotifications(){
    if(!('Notification' in window))return toast('This device/browser does not support notifications.');
    if(Notification.permission==='default')await Notification.requestPermission();
    if(Notification.permission!=='granted')return toast('Notification permission is blocked. Enable notifications for Rayy in your browser/iPhone settings.');
    toast('Notifications are enabled for Rayy.');
  }
  function showRayyNotification(title,body){if(Notification.permission==='granted')new Notification(title,{body,icon:'icon.png',tag:title});}
  function notificationTick(){
    const d=get(),now=new Date(),hh=String(now.getHours()).padStart(2,'0'),mm=String(now.getMinutes()).padStart(2,'0'),hm=hh+':'+mm;
    const morning=d.settings?.morningTime||'08:00',night=d.settings?.nightTime||'21:00',day=now.toISOString().slice(0,10);
    if(d.settings?.notifyMorning&&hm===morning&&localStorage.getItem('rayy_notified_morning_'+day)!=='1'){rawSet('rayy_notified_morning_'+day,'1');showRayyNotification('Rayy — Good morning','Your day is ready. Review your schedule and priorities.');}
    if(d.settings?.notifyNight&&hm===night&&localStorage.getItem('rayy_notified_night_'+day)!=='1'){rawSet('rayy_notified_night_'+day,'1');showRayyNotification('Rayy — Night review','Take a minute to review what you completed and what moves to tomorrow.');}
  }
  setInterval(notificationTick,15000);
  const settingsBtn=$('settingsBtn');if(settingsBtn)settingsBtn.addEventListener('click',()=>setTimeout(()=>{injectAuthUI();const b=document.getElementById('rayyNotifyButton');if(!b&&$('rayyCloudBox')){$('rayyCloudBox').insertAdjacentHTML('beforeend','<div class="authActions"><button id="rayyNotifyButton" class="secondaryAuth">Enable notifications</button></div>');$('rayyNotifyButton').onclick=ensureNotifications;}},30));

  bind();setTimeout(bind,80);setTimeout(fixOvernightBlocks,180);loadSupabase();
  const wait=setInterval(()=>{if(window.supabase){clearInterval(wait);startCloud(window.supabase)}},100);setTimeout(()=>clearInterval(wait),15000);
})();
