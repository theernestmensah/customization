/* NO NAME mockup: router + views. Vanilla, no build step, works from file://. */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var C=JT.config, B=JT.blanks, root=document.documentElement;
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var store={get:function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var colour=function(id){return JT.colours.filter(function(c){return c.id===id})[0]||JT.colours[0]};
var ARROW='<svg class="i" aria-hidden="true"><use href="#i-arrow"/></svg>';
JT.$=$;JT.$$=$$;JT.store=store;JT.esc=esc;JT.colour=colour;JT.RM=RM;JT.ARROW=ARROW;

/* ---------- client notes toggle ---------- */
function setNotes(on){root.classList.toggle('notes',on);$('#notesBtn').setAttribute('aria-pressed',String(on));store.set('nn_notes',on)}
$('#notesBtn').addEventListener('click',function(){var on=!root.classList.contains('notes');setNotes(on);toast(on?'Client notes on. Yellow marks are placeholders to confirm.':'Client notes hidden.')});
setNotes(store.get('nn_notes',false));

/* ---------- money ---------- */
JT.cur=store.get('nn_cur','GHS');
JT.fmt=function(ghs){return JT.cur==='USD' ? 'US$ '+(ghs/C.usdRate).toFixed(2) : 'GH₵ '+Math.round(ghs).toLocaleString('en-GH')};
JT.priceHTML=function(ghs){return '<span class="price">'+JT.fmt(ghs)+'</span>'};
function syncCur(){$$('[data-cur]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.cur===JT.cur))})}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-cur]');if(!b||b.dataset.cur===JT.cur)return;
  JT.cur=b.dataset.cur;store.set('nn_cur',JT.cur);syncCur();route(true);renderDrawer();
  toast('Prices in '+(JT.cur==='USD'?'US dollars':'Ghana cedis')+'. Sample rate 1 USD = '+C.usdRate+' GHS.');
});
syncCur();

/* ---------- toast ---------- */
var tt;function toast(m){var t=$('#toast');t.textContent=m;t.hidden=true;void t.offsetWidth;t.hidden=false;clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},3000)}JT.toast=toast;

/* ---------- jobs, WhatsApp ---------- */
JT.newJob=function(){return C.jobPrefix+String(1000+Math.floor(Math.random()*9000))};
JT.wa=function(text){return 'https://wa.me/'+C.whatsapp+'?text='+encodeURIComponent(text+' (Sent from mockup site)')};
function waLinks(){$$('[data-wa]').forEach(function(a){a.href=JT.wa(a.dataset.wa)})}
waLinks();

/* ---------- slider fill ---------- */
JT.fillSlider=function(s){var p=(s.value-s.min)/(s.max-s.min)*100;s.style.setProperty('--p',p+'%')};

/* ---------- product SVG: shaded garment, stitch lines, ground shadow ---------- */
JT.markFS=function(a,t){return Math.min(a[3]*.5,a[2]/(Math.max(t.length,2)*.5))};
JT.blankSVG=function(id,hex,mark,opt){
  opt=opt||{};var b=B[id],edge=JT.mix(hex,'#000000',.42),dark=JT.lum(hex)<.4,s='';
  var lbl=opt.label!=null?opt.label:(b.name+(mark&&mark.t?' printed with '+mark.t:', blank'));
  s+='<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"'+(lbl?' role="img" aria-label="'+esc(lbl)+'"':' aria-hidden="true" focusable="false"')+'>';
  if(opt.floor!==false)s+='<ellipse cx="200" cy="'+b.floor+'" rx="'+b.fw+'" ry="13" fill="url(#nn-floor)"/>';
  b.details.forEach(function(d){if(d.k==='strap')s+='<path d="'+d.d+'" fill="none" stroke="'+edge+'" stroke-width="16" stroke-linecap="round"/><path d="'+d.d+'" fill="none" stroke="'+hex+'" stroke-width="11" stroke-linecap="round"/>'});
  s+='<path d="'+b.body+'" fill="'+hex+'" stroke="'+edge+'" stroke-width="2.5" stroke-linejoin="round"/>';
  b.details.forEach(function(d){
    if(d.k==='shade')s+='<path d="'+d.d+'" fill="'+JT.mix(hex,'#000000',.15)+'" stroke="'+edge+'" stroke-width="2" stroke-linejoin="round"/>';
    if(d.k==='line')s+='<path d="'+d.d+'" fill="none" stroke="'+(dark?'rgba(255,255,255,.24)':'rgba(20,19,17,.26)')+'" stroke-width="1.6" stroke-dasharray="4 3.5" stroke-linecap="round"/>';
  });
  var a=b.area;
  if(opt.area)s+='<rect x="'+a[0]+'" y="'+a[1]+'" width="'+a[2]+'" height="'+a[3]+'" rx="2" fill="none" stroke="'+JT.inkFor(hex)+'" stroke-opacity=".45" stroke-dasharray="6 5" stroke-width="1.5"/>';
  if(mark&&mark.t){
    var t=String(mark.t).toUpperCase(),fs=JT.markFS(a,t);
    s+='<text x="'+(a[0]+a[2]/2)+'" y="'+(a[1]+a[3]/2)+'" text-anchor="middle" dominant-baseline="central" font-family="Archivo,sans-serif" font-weight="900" style="font-stretch:62%" font-size="'+fs.toFixed(1)+'" fill="'+(mark.c||JT.inkFor(hex))+'" fill-opacity=".96">'+esc(t)+'</text>';
  }
  s+='<path d="'+b.body+'" fill="url(#nn-shade)"/>';
  return s+'</svg>';
};
function inkOn(hex){return JT.inkFor(hex)==='#141311'?'#C2301A':'#F2C230'}
JT.inkOn=inkOn;

/* ---------- cart + drawer ---------- */
JT.cart=store.get('nn_cart',[]);
function cartCount(){return JT.cart.reduce(function(a,l){return a+l.qty},0)}
function cartTotal(){return JT.cart.reduce(function(a,l){return a+l.unit*l.qty},0)}
JT.saveCart=function(){
  store.set('nn_cart',JT.cart);var n=cartCount();
  $('#cartN').textContent=n;$('#cartBtn').setAttribute('aria-label','Cart, '+n+' item'+(n===1?'':'s'));
  if(!$('#drawer').hidden)renderDrawer();
};
JT.addToCart=function(line){
  line.key=line.key||String(Date.now())+Math.random().toString(36).slice(2,6);
  JT.cart.push(line);JT.saveCart();
  var cb=$('#cartBtn');cb.classList.remove('is-bump');void cb.offsetWidth;cb.classList.add('is-bump');
  openDrawer(line.key);
};
function lineArt(l){var c=colour(l.colour);return l.thumb?'<img src="'+l.thumb+'" alt="Proof of '+esc(l.name)+'">':JT.blankSVG(l.blank,c.hex,l.mark,{label:'',floor:false})}
function lineMeta(l){return [B[l.blank].name,colour(l.colour).name,l.size,l.desc].filter(Boolean).map(esc).join(' · ')}
function stepperHTML(l,cls){return '<div class="stepper'+(cls||'')+'" role="group" aria-label="Quantity for '+esc(l.name)+'"><button type="button" data-k="'+l.key+'" data-a="-1" aria-label="One fewer">−</button><output>'+l.qty+'</output><button type="button" data-k="'+l.key+'" data-a="1" aria-label="One more">+</button></div>'}
function lineAction(k,a){
  var l=JT.cart.filter(function(x){return x.key===k})[0];if(!l)return;
  if(a==='rm'){JT.cart=JT.cart.filter(function(x){return x!==l});toast('Removed '+l.name+'.')}
  else l.qty=Math.max(1,Math.min(999,l.qty+(+a)));
  JT.saveCart();
}
var drawerFrom=null,newKey=null;
function openDrawer(key){
  var d=$('#drawer');newKey=key||null;
  if(d.hidden){drawerFrom=document.activeElement;d.hidden=false;d.classList.remove('is-closing');root.classList.add('locked')}
  renderDrawer();
  setTimeout(function(){var f=$('#drawer .is-new .stepper button:last-child')||$('#drClose');f.focus()},40);
}
function closeDrawer(silent){
  var d=$('#drawer');if(d.hidden)return;root.classList.remove('locked');
  if(RM||silent){d.hidden=true}else{d.classList.add('is-closing');setTimeout(function(){d.hidden=true;d.classList.remove('is-closing')},270)}
  if(!silent&&drawerFrom&&drawerFrom.focus)drawerFrom.focus();
}
JT.openDrawer=openDrawer;
function renderDrawer(){
  var n=cartCount(),body=$('#drBody'),foot=$('#drFoot');
  $('#drN').textContent=n?'('+n+')':'';
  if(!JT.cart.length){
    body.innerHTML='<div class="drawer__empty"><p class="h3">Nothing on the ticket yet.</p><p class="small">Start with a blank in the Studio, or pick something off the rail.</p><div class="empty__row"><a class="btn btn--red btn--sm" href="#/studio">Start a job</a><a class="btn btn--sm" href="#/shop">Shop the rail</a></div></div>';
    foot.hidden=true;return;
  }
  foot.hidden=false;
  body.innerHTML=JT.cart.map(function(l){return '<div class="mini'+(l.key===newKey?' is-new':'')+'"><div class="mini__art">'+lineArt(l)+'</div><div><p class="mini__name">'+esc(l.name)+'</p><p class="mini__meta">'+lineMeta(l)+(l.jt?' · '+esc(l.jt):'')+'</p><div class="mini__row">'+stepperHTML(l,' stepper--sm')+JT.priceHTML(l.unit*l.qty)+'</div></div><button class="iconbtn iconbtn--sm" type="button" data-k="'+l.key+'" data-a="rm" aria-label="Remove '+esc(l.name)+'"><svg class="i" aria-hidden="true"><use href="#i-close"/></svg></button></div>'}).join('');
  foot.innerHTML='<div class="sum"><div class="tot"><span>Subtotal</span><span>'+JT.fmt(cartTotal())+'</span></div></div><p class="small">Delivery and payment on the next step.</p><a class="btn btn--red btn--block" href="#/cart">Checkout '+ARROW+'</a><button class="btn btn--block" type="button" data-close>Keep shopping</button>';
  newKey=null;
}
$('#drawer').addEventListener('click',function(e){
  if(e.target.closest('[data-close]')){closeDrawer();return}
  var b=e.target.closest('[data-a]');if(b){lineAction(b.dataset.k,b.dataset.a);var f=$('#drawer [data-k="'+b.dataset.k+'"][data-a="'+b.dataset.a+'"]');if(f)f.focus();else $('#drClose').focus()}
});
$('#drawer').addEventListener('keydown',function(e){
  if(e.key==='Escape'){closeDrawer();return}
  if(e.key!=='Tab')return;
  var f=$$('#drawer .drawer__panel a[href],#drawer .drawer__panel button:not([disabled])'),first=f[0],last=f[f.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
$('#cartBtn').addEventListener('click',function(e){if(parse().v==='cart')return;e.preventDefault();openDrawer()});
JT.saveCart();

/* ---------- mobile menu ---------- */
var menu=$('#menu'),mb=$('#menuBtn');
function openMenu(){menu.style.top=$('#hdr').getBoundingClientRect().bottom+'px';menu.hidden=false;mb.setAttribute('aria-expanded','true');mb.firstChild.textContent='Close';root.classList.add('locked')}
function closeMenu(){if(menu.hidden)return;menu.hidden=true;mb.setAttribute('aria-expanded','false');mb.firstChild.textContent='Menu';root.classList.remove('locked')}
mb.addEventListener('click',function(){menu.hidden?openMenu():closeMenu()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!menu.hidden){closeMenu();mb.focus()}});

/* ---------- swing tag (rail + shop) ---------- */
function studioHref(p,c){return '#/studio?blank='+p.blank+'&colour='+(c||p.colour)+(p.mark?'&text='+encodeURIComponent(p.mark.t):'')}
function tagHTML(p){
  var c=colour(p.colour),b=B[p.blank];
  return '<article class="tag" role="listitem"><div class="tag__card"><span class="tag__hole" aria-hidden="true"></span>'+
    (p.mark?'':'<span class="tag__flag">Blank</span>')+
    '<a class="tag__art" href="#/product/'+p.id+'" tabindex="-1" aria-hidden="true">'+JT.blankSVG(p.blank,c.hex,p.mark,{label:''})+'</a>'+
    '<div class="tag__body"><h3 class="tag__name"><a href="#/product/'+p.id+'">'+esc(p.name)+'</a></h3><p class="tag__meta">'+b.name+' · '+c.name+'</p>'+
    '<div class="tag__foot">'+JT.priceHTML(JT.priceOf(p))+'<a class="tag__mk" href="'+studioHref(p)+'">Make it yours<span class="sr"> in the Studio: '+esc(p.name)+'</span>'+ARROW+'</a></div></div></div></article>';
}

/* =================== HOME =================== */
var hero={c:'white',t:'',run:false,user:false,timer:0,i:0,pos:0,phase:'type',inView:true,stampT:0};
function heroDraw(){
  var c=colour(hero.c),t=hero.t;
  $('#heroTee').innerHTML=JT.blankSVG('tee',c.hex,t?{t:t,c:inkOn(c.hex)}:null,{area:true,label:''});
  $('#heroItem').textContent='Tee · '+c.name;
  $('#heroMark').textContent=t||' ';
}
function heroSw(){$$('#heroSw .swatch').forEach(function(x){var on=x.dataset.c===hero.c;x.setAttribute('aria-checked',String(on));x.tabIndex=on?0:-1})}
function heroStamp(on){var s=$('#heroStamp');s.classList.remove('is-on');if(on){void s.offsetWidth;s.classList.add('is-on')}}
function heroVisible(){return hero.inView&&!document.hidden&&!$('[data-view=home]').hidden}
function heroTick(){
  if(!hero.run)return;
  if(!heroVisible()){hero.timer=setTimeout(heroTick,500);return}
  var name=JT.heroNames[hero.i%JT.heroNames.length];
  if(hero.phase==='type'){
    hero.pos++;hero.t=name.slice(0,hero.pos);heroDraw();
    if(hero.pos>=name.length){hero.phase='hold';heroStamp(true);hero.timer=setTimeout(heroTick,2100)}
    else hero.timer=setTimeout(heroTick,70+Math.random()*80);
  }else if(hero.phase==='hold'){hero.phase='erase';heroStamp(false);hero.timer=setTimeout(heroTick,120)}
  else{
    hero.pos--;hero.t=name.slice(0,hero.pos);heroDraw();
    if(hero.pos<=0){hero.phase='type';hero.i++;hero.c=JT.heroCols[hero.i%JT.heroCols.length];heroSw();heroDraw();hero.timer=setTimeout(heroTick,420)}
    else hero.timer=setTimeout(heroTick,28);
  }
}
function heroStart(){if(hero.run||hero.user||RM)return;hero.run=true;hero.timer=setTimeout(heroTick,600)}
function heroStop(){hero.run=false;clearTimeout(hero.timer)}
function heroSetup(){
  var sw=$('#heroSw'),inp=$('#tryIn');
  if(!sw.dataset.bound){
    sw.dataset.bound=1;
    sw.innerHTML=JT.colours.map(function(c){return '<button type="button" class="swatch" role="radio" aria-checked="false" aria-label="'+c.name+'" data-c="'+c.id+'" style="--c:'+c.hex+'"><i></i></button>'}).join('');
    radioGroup(sw,'.swatch',function(b){takeOver();hero.c=b.dataset.c;heroDraw()});
    function takeOver(){if(hero.user)return;hero.user=true;heroStop();if(hero.phase!=='type'||hero.pos)hero.t=JT.heroNames[hero.i%JT.heroNames.length];heroDraw();heroStamp(true)}
    inp.addEventListener('focus',takeOver);
    inp.addEventListener('input',function(){
      takeOver();hero.t=inp.value.toUpperCase().trim();heroDraw();heroStamp(false);
      clearTimeout(hero.stampT);if(hero.t)hero.stampT=setTimeout(function(){heroStamp(true)},800);
      store.set('nn_mark',{t:hero.t,c:hero.c});
    });
    $('#tryForm').addEventListener('submit',function(e){e.preventDefault();var t=(inp.value.trim()||hero.t||'YOUR NAME').toUpperCase();location.hash='#/studio?blank=tee&colour='+hero.c+'&text='+encodeURIComponent(t)});
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){hero.inView=es[0].isIntersecting},{threshold:.15}).observe($('#bed'));
    var saved=store.get('nn_mark',null);
    if(saved&&saved.t){hero.user=true;hero.t=saved.t;hero.c=saved.c||'white';inp.value=saved.t;heroStamp(true)}
    else if(RM){hero.t=JT.heroNames[0];heroStamp(true)}
  }
  heroSw();heroDraw();heroStart();
}
function home(soft){
  heroSetup();
  var tk=$('#ticker');
  if(!tk.dataset.done){tk.dataset.done=1;var items=JT.tickerNames.map(function(n){return '<span class="ticker__item">'+esc(n)+'</span>'}).join('');tk.innerHTML=items+items}
  // 01 bento of blanks
  var cols={tee:'white',hoodie:'black',cap:'red',mug:'white',case:'yellow',tote:'sand'};
  $('#bento').innerHTML=Object.keys(cols).map(function(id,i){var b=B[id];
    return '<a class="tile tile--'+id+'" href="#/studio?blank='+id+'&colour='+cols[id]+'" data-reveal style="--d:'+(i*.06)+'s"><span class="tile__top"><span class="tile__name">'+b.name+'</span><span class="tile__from">from '+JT.priceHTML(b.price)+'</span></span><span class="tile__art" aria-hidden="true">'+JT.blankSVG(id,colour(cols[id]).hex,null,{label:''})+'</span><span class="tile__go"><span>Design<span class="tile__noun"> '+b.noun+'</span></span>'+ARROW+'</span></a>'}).join('')+
    '<a class="tile tile--cta" href="#/studio" data-reveal style="--d:.36s"><span class="tile__top"><span class="tile__name">Can’t decide?</span></span><span class="tile__copy">Open the Studio and try all six. Your design moves with you when you switch.</span><span class="tile__go">Open the Studio'+ARROW+'</span></a>';
  // 02 process
  processSetup();
  // 03 rail
  var r=$('#railTrack');r.innerHTML=JT.products.map(tagHTML).join('');
  if(!r.dataset.bound){r.dataset.bound=1;
    var step=function(d){return function(){r.scrollBy({left:d*Math.max(260,r.clientWidth*.7),behavior:RM?'auto':'smooth'})}};
    $('#railPrev').addEventListener('click',step(-1));$('#railNext').addEventListener('click',step(1));
    var upd=function(){$('#railPrev').disabled=r.scrollLeft<8;$('#railNext').disabled=r.scrollLeft+r.clientWidth>r.scrollWidth-8};
    r.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);setTimeout(upd,50);
  }
  // 04 wall
  var ars=['1','4/5','1','5/6','4/5','1','1','4/5'];
  $('#wall').innerHTML=JT.jobs.map(function(j,i){var c=colour(j.colour);
    return '<figure class="job" data-reveal style="--d:'+(i%4*.07)+'s;--jbg:'+JT.mix(c.hex,'#E5E0D3',.78)+';--ar:'+ars[i]+'"><span class="job__qty">×'+j.qty+'</span><div class="job__art">'+JT.blankSVG(j.blank,c.hex,j.mark,{label:j.what+', '+c.name+', printed '+j.mark.t})+'</div><figcaption><b>'+esc(j.what)+'</b><span>'+j.jt+' · '+esc(j.place)+'</span></figcaption></figure>'}).join('');
  // 05 inks
  $('#inks').innerHTML='<div class="ink ink--head" aria-hidden="true"><span></span><span class="lbl">Method</span><span class="lbl">Best for</span><span class="lbl">Feel</span><span class="lbl">From</span></div>'+
    JT.inks.map(function(k){return '<div class="ink" role="listitem"><span class="ink__pot" aria-hidden="true"><i style="--c:'+k.c+'"></i></span><h3 class="ink__name">'+k.name+'</h3><p class="ink__c"><span class="lbl">Best for</span>'+k.best+'</p><p class="ink__c"><span class="lbl">Feel</span>'+k.feel+'</p><p class="ink__c"><span class="lbl">From</span><i class="ph">'+k.from+'</i></p></div>'}).join('');
  // 06 faq + track
  $('#faq').innerHTML=JT.faq.map(function(f){return '<div><dt>'+f[0]+'</dt><dd>'+f[1]+'</dd></div>'}).join('');
  var ht=$('#homeTrack');
  if(!ht.dataset.bound){ht.dataset.bound=1;ht.addEventListener('submit',function(e){e.preventDefault();location.hash='#/track?jt='+encodeURIComponent($('#htJt').value.trim()||'NN-0427')})}
  // 07 bulk stack
  $('#bulkStack').innerHTML=[['tee','green','CHOIR'],['tee','navy','CHOIR'],['tee','red','CHOIR']].map(function(x){var h=colour(x[1]).hex;return JT.blankSVG(x[0],h,{t:x[2],c:inkOn(h)},{label:'',floor:false})}).join('')+'<span class="bulkband__count">×40</span>';
}
function processSetup(){
  var d=$('#liveDocket'),steps=$$('.step');
  function set(n){
    $$('[data-at]',d).forEach(function(x){x.classList.toggle('is-on',+x.dataset.at<=n)});
    steps.forEach(function(s){s.classList.toggle('is-on',+s.dataset.step===n)});
    var h=colour('black').hex;$('#liveThumb').innerHTML=JT.blankSVG('hoodie',h,n>=1?{t:'KOFI & AMA',c:'#F7F5EF'}:null,{label:'',area:n<1,floor:false});
  }
  if(d.dataset.bound){return}
  d.dataset.bound=1;
  var mq=window.matchMedia&&matchMedia('(min-width:960px)');
  if(!('IntersectionObserver' in window)||!mq||RM){set(4);return}
  set(mq.matches?0:4);
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&mq.matches)set(+e.target.dataset.step)})},{rootMargin:'-45% 0px -45% 0px'});
  steps.forEach(function(s){io.observe(s)});
  if(mq.addEventListener)mq.addEventListener('change',function(){if(!mq.matches)set(4)});
}

/* reveal on scroll */
var rio=null;
function reveal(instant){
  var els=$$('[data-reveal]:not(.in)');
  if(instant||RM||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  if(!rio)rio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px',threshold:.06});
  els.forEach(function(e){rio.observe(e)});
}

/* radio-group helper: click + arrow keys, aria-checked */
function radioGroup(rootEl,sel,on){
  rootEl.addEventListener('click',function(e){var b=e.target.closest(sel);if(!b||!rootEl.contains(b))return;pick(b)});
  rootEl.addEventListener('keydown',function(e){var k=e.key;if(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].indexOf(k)<0)return;var bs=$$(sel,rootEl),i=bs.indexOf(document.activeElement);if(i<0)return;e.preventDefault();var n=bs[(i+(k==='ArrowRight'||k==='ArrowDown'?1:-1)+bs.length)%bs.length];n.focus();pick(n)});
  function pick(b){$$(sel,rootEl).forEach(function(x){x.setAttribute('aria-checked',String(x===b));x.tabIndex=x===b?0:-1});on(b)}
  var bs=$$(sel,rootEl);bs.forEach(function(x){x.tabIndex=x.getAttribute('aria-checked')==='true'?0:-1});if(!bs.some(function(x){return x.tabIndex===0})&&bs[0])bs[0].tabIndex=0;
}
JT.radioGroup=radioGroup;
function swatchesHTML(cur,id,lbl){return '<div class="swatches" id="'+id+'" role="radiogroup" aria-labelledby="'+lbl+'">'+JT.colours.map(function(c){return '<button type="button" class="swatch" role="radio" aria-checked="'+(c.id===cur)+'" aria-label="'+c.name+'" data-c="'+c.id+'" style="--c:'+c.hex+'"><i></i></button>'}).join('')+'</div>'}

/* =================== SHOP =================== */
var refocus=null;
function shop(el,q){
  var cat=q.c||'all',col=q.col||'',sort=q.sort||'featured';
  var cats=[['all','All'],['apparel','Apparel'],['gifts','Gifts'],['accessories','Accessories']];
  var inCat=function(p,c){return c==='all'||B[p.blank].group===c};
  var list=JT.products.filter(function(p){return inCat(p,cat)&&(!col||p.colour===col)});
  if(sort==='low')list.sort(function(a,b){return JT.priceOf(a)-JT.priceOf(b)});
  if(sort==='high')list.sort(function(a,b){return JT.priceOf(b)-JT.priceOf(a)});
  el.innerHTML='<div class="wrap"><header class="pagehead"><p class="eyebrow"><span class="eyebrow__no">03</span>Shop</p><h1 class="display">The rail</h1><p class="lede">Ready-made pieces and plain blanks. Anything here can go into the Studio for your own mark. <span class="tbc">Real catalogue TBC</span></p></header>'+
    '<div class="toolbar"><div class="toolbar__group" role="group" aria-label="Category">'+cats.map(function(c){return '<button class="chip" type="button" data-cat="'+c[0]+'" aria-pressed="'+(c[0]===cat)+'">'+c[1]+' <span class="n">'+JT.products.filter(function(p){return inCat(p,c[0])}).length+'</span></button>'}).join('')+'</div>'+
    '<div class="toolbar__group"><div class="swatches coldots" role="group" aria-label="Colour">'+JT.colours.map(function(c){return '<button type="button" class="swatch" data-col="'+c.id+'" aria-pressed="'+(c.id===col)+'" aria-label="'+c.name+'" title="'+c.name+'" style="--c:'+c.hex+'"><i></i></button>'}).join('')+'</div>'+
    '<label class="sr" for="sortSel">Sort</label><select class="input sortsel" id="sortSel"><option value="featured">Featured</option><option value="low">Price, low to high</option><option value="high">Price, high to low</option></select></div></div>'+
    '<p class="small count" aria-live="polite">'+list.length+' item'+(list.length===1?'':'s')+(col?' in '+colour(col).name.toLowerCase():'')+'</p>'+
    (list.length?'<div class="grid" role="list">'+list.map(tagHTML).join('')+'</div>'
      :'<div class="empty"><p class="h3">Nothing in '+colour(col).name.toLowerCase()+' here yet.</p><p class="small">Every blank comes in every colour in the Studio, so you can still make one.</p><div class="empty__row"><button class="btn btn--sm" type="button" data-clear>Clear filters</button><a class="btn btn--red btn--sm" href="#/studio?colour='+col+'">Make one in '+colour(col).name.toLowerCase()+'</a></div></div>')+'</div>';
  $('#sortSel',el).value=sort;
  function go(o,focusSel){var p={c:cat,col:col,sort:sort},k;for(k in o)p[k]=o[k];var qs=[];if(p.c!=='all')qs.push('c='+p.c);if(p.col)qs.push('col='+p.col);if(p.sort!=='featured')qs.push('sort='+p.sort);refocus=focusSel;location.hash='#/shop'+(qs.length?'?'+qs.join('&'):'')}
  $$('[data-cat]',el).forEach(function(b){b.addEventListener('click',function(){go({c:b.dataset.cat},'[data-cat="'+b.dataset.cat+'"]')})});
  $$('[data-col]',el).forEach(function(b){b.addEventListener('click',function(){go({col:b.dataset.col===col?'':b.dataset.col},'[data-col="'+b.dataset.col+'"]')})});
  $('#sortSel',el).addEventListener('change',function(e){go({sort:e.target.value},'#sortSel')});
  var cl=$('[data-clear]',el);if(cl)cl.addEventListener('click',function(){go({c:'all',col:'',sort:'featured'},'[data-cat="all"]')});
}

/* =================== PRODUCT =================== */
function product(el,q,id){
  var p=JT.products.filter(function(x){return x.id===id})[0];
  if(!p){notFound(el,'That item isn’t on the rail.');return}
  var b=B[p.blank],st={c:p.colour,size:b.group==='apparel'?(p.blank==='cap'?'One size':'M'):null,qty:1};
  var sizes=p.blank==='cap'?['One size']:b.group==='apparel'?['S','M','L','XL','XXL']:null;
  var related=JT.products.filter(function(x){return x.id!==p.id&&B[x.blank].group===b.group}).concat(JT.products.filter(function(x){return B[x.blank].group!==b.group})).slice(0,4);
  el.innerHTML='<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/shop">Shop</a><span aria-hidden="true">/</span><a href="#/shop?c='+b.group+'">'+b.group[0].toUpperCase()+b.group.slice(1)+'</a><span aria-hidden="true">/</span><span aria-current="page">'+esc(p.name)+'</span></nav><div class="pdp">'+
    '<div class="pdp__stage" id="pdpArt"></div>'+
    '<div class="pdp__info"><p class="eyebrow"><span class="eyebrow__no">'+b.name.toUpperCase()+'</span>Off the rail</p><h1>'+esc(p.name)+'</h1>'+
    '<div class="pdp__price" id="pdpPrice"></div><p class="pdp__desc"><i class="ph">'+b.desc+'</i></p>'+
    '<div class="field"><span class="lbl" id="pcL">Colour: <span id="pcN"></span></span>'+swatchesHTML(st.c,'pdpSw','pcL')+'</div>'+
    (sizes?'<div class="field"><div class="pdp__row"><span class="lbl" id="psL">Size</span>'+(sizes.length>1?'<button class="linkbtn" type="button" id="sizeGuide">Size guide</button>':'')+'</div><div class="sizes" id="pdpSz" role="radiogroup" aria-labelledby="psL">'+sizes.map(function(s){return '<button type="button" class="chip" role="radio" aria-checked="'+(s===st.size)+'" data-s="'+s+'">'+s+'</button>'}).join('')+'</div></div>':'')+
    '<div class="field"><span class="lbl" id="pqL">Quantity</span><div class="stepper" role="group" aria-labelledby="pqL"><button type="button" data-d="-1" aria-label="One fewer">−</button><output id="pq" aria-live="polite">1</output><button type="button" data-d="1" aria-label="One more">+</button></div></div>'+
    '<div class="pdp__actions"><button class="btn btn--red btn--block" id="pdpAdd" type="button">Add to cart</button>'+
    '<a class="btn btn--block" id="pdpMake" href="#">Make it yours in the Studio '+ARROW+'</a>'+
    '<a class="btn btn--block btn--ink" id="pdpWa" target="_blank" rel="noopener" href="#"><svg class="i" aria-hidden="true"><use href="#i-chat"/></svg>Order on WhatsApp</a></div>'+
    '<dl class="specs"><div><dt>Material</dt><dd><i class="ph">'+b.fabric+'</i></dd></div><div><dt>Print</dt><dd><i class="ph">'+(p.mark?'DTF, front':'Blank, add your own in the Studio')+'</i></dd></div><div><dt>Ready in</dt><dd><i class="ph">3 to 5 working days</i></dd></div><div><dt>Delivery</dt><dd><i class="ph">Rider in Accra, courier elsewhere</i> <span class="tbc">TBC</span></dd></div><div><dt>Returns</dt><dd>Custom prints are final sale. <a href="#/info/returns">Returns policy</a></dd></div></dl></div></div>'+
    '<section class="related" aria-labelledby="h-rel"><header class="sechead"><div><p class="eyebrow"><span class="eyebrow__no">+</span>Also on the rail</p><h2 class="h2" id="h-rel">You might like</h2></div></header><div class="grid" role="list">'+related.map(tagHTML).join('')+'</div></section></div>'+
    '<div class="stickybar"><span id="pdpPrice2"></span><button class="btn btn--red btn--sm" id="pdpAdd2" type="button">Add to cart</button></div>'+
    '<div class="sheet" id="sizeSheet" hidden><div class="sheet__in" role="dialog" aria-modal="true" aria-labelledby="sgH"><div class="sheet__top"><div><p class="eyebrow">Size guide</p><h2 class="h3" id="sgH">'+b.name+' sizes</h2></div><button class="iconbtn" type="button" data-shut aria-label="Close size guide"><svg class="i" aria-hidden="true"><use href="#i-close"/></svg></button></div>'+
    '<table class="sizetable"><caption class="sr">Body measurements in centimetres</caption><thead><tr><th scope="col">Size</th><th scope="col">Chest</th><th scope="col">Length</th></tr></thead><tbody>'+[['S','92–97','69'],['M','98–104','72'],['L','105–112','74'],['XL','113–120','77'],['XXL','121–128','79']].map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+' cm</td><td>'+r[2]+' cm</td></tr>'}).join('')+'</tbody></table><p class="small">Sample measurements. Real chart to come from the supplier. <span class="tbc">TBC</span></p></div></div>';
  function draw(){
    var c=colour(st.c),unit=JT.priceOf(p),art=$('#pdpArt');
    art.style.setProperty('--tint',JT.mix(c.hex,'#E5E0D3',.8));
    art.innerHTML=(p.mark?'':'<span class="tag__flag">Blank</span>')+JT.blankSVG(p.blank,c.hex,p.mark,{label:p.name+' in '+c.name});
    $('#pcN').textContent=c.name;$('#pq').textContent=st.qty;
    $('#pdpPrice').innerHTML=JT.priceHTML(unit)+(st.qty>1?'<span class="small">× '+st.qty+' = '+JT.fmt(unit*st.qty)+'</span>':'');
    $('#pdpPrice2').innerHTML=JT.priceHTML(unit*st.qty);
    $('#pdpMake').href=studioHref(p,st.c);
    $('#pdpWa').href=JT.wa('Hello NO NAME, I would like to order: '+p.name+', '+c.name+(st.size?', size '+st.size:'')+', qty '+st.qty+'.');
  }
  radioGroup($('#pdpSw'),'.swatch',function(x){st.c=x.dataset.c;draw()});
  if(sizes)radioGroup($('#pdpSz'),'.chip',function(x){st.size=x.dataset.s});
  $$('.pdp .stepper button',el).forEach(function(x){x.addEventListener('click',function(){st.qty=Math.max(1,Math.min(99,st.qty+(+x.dataset.d)));draw()})});
  function add(){JT.addToCart({kind:'ready',pid:p.id,blank:p.blank,colour:st.c,size:st.size,qty:st.qty,unit:JT.priceOf(p),name:p.name,mark:p.mark})}
  $('#pdpAdd').addEventListener('click',add);$('#pdpAdd2').addEventListener('click',add);
  var sg=$('#sizeGuide',el),sh=$('#sizeSheet',el);
  if(sg){sg.addEventListener('click',function(){sh.hidden=false;$('[data-shut]',sh).focus()});
    sh.addEventListener('click',function(e){if(e.target===sh||e.target.closest('[data-shut]')){sh.hidden=true;sg.focus()}});
    sh.addEventListener('keydown',function(e){if(e.key==='Escape'){sh.hidden=true;sg.focus()}})}
  draw();
}

/* =================== CART =================== */
function cart(el){
  var st=store.get('nn_pay',{m:'momo',net:'MTN',ship:'delivery',name:'',phone:'',area:'',momo:''});
  function save(){store.set('nn_pay',st)}
  function render(){
    var n=JT.cart.length,total=cartTotal();
    el.innerHTML='<div class="wrap"><header class="pagehead"><p class="eyebrow"><span class="eyebrow__no">→</span>Jobs to press</p><h1 class="display">Cart</h1></header><div class="cart"><div>'+
      (n?'<div class="lines">'+JT.cart.map(function(l){return '<div class="line"><div class="line__art">'+lineArt(l)+'</div><div><div class="line__top"><div><div class="line__name">'+esc(l.name)+'</div><div class="line__meta">'+lineMeta(l)+'</div></div><button class="iconbtn iconbtn--sm" type="button" data-k="'+l.key+'" data-a="rm" aria-label="Remove '+esc(l.name)+'"><svg class="i" aria-hidden="true"><use href="#i-close"/></svg></button></div><div class="line__bot">'+(l.jt?'<span class="stamp stamp--ink stamp--sm">'+esc(l.jt)+'</span>':'')+stepperHTML(l,'')+JT.priceHTML(l.unit*l.qty)+'</div></div></div>'}).join('')+'</div><a class="backlink" href="#/shop"><svg class="i" aria-hidden="true"><use href="#i-left"/></svg>Keep shopping</a>'
        :'<div class="empty"><p class="h3">Nothing on the ticket yet.</p><p class="small">Start with a blank in the Studio, or pick something ready-made.</p><div class="empty__row"><a class="btn btn--red" href="#/studio">Start a job</a><a class="btn" href="#/shop">Shop the rail</a></div></div>')+
      '</div><aside class="card pay" aria-labelledby="payH"><h2 id="payH" class="h3">Checkout</h2>'+
      '<div class="field"><label for="cName">Your name</label><input class="input" id="cName" autocomplete="name" value="'+esc(st.name)+'" aria-describedby="cNameE"><p class="err" id="cNameE"></p></div>'+
      '<div class="field"><label for="cPhone">Phone (for WhatsApp proof)</label><input class="input mono" id="cPhone" inputmode="tel" autocomplete="tel" placeholder="024 000 0000" value="'+esc(st.phone)+'" aria-describedby="cPhoneE"><p class="err" id="cPhoneE"></p></div>'+
      '<div class="field"><span class="lbl" id="shL">Get it by</span><div class="nets" id="ship" role="radiogroup" aria-labelledby="shL"><button type="button" class="chip" role="radio" data-v="delivery" aria-checked="'+(st.ship==='delivery')+'">Delivery</button><button type="button" class="chip" role="radio" data-v="pickup" aria-checked="'+(st.ship==='pickup')+'">Pickup</button></div></div>'+
      (st.ship==='delivery'?'<div class="field"><label for="cArea">Area and landmark</label><input class="input" id="cArea" autocomplete="street-address" placeholder="e.g. East Legon, near the A&amp;C Mall" value="'+esc(st.area)+'" aria-describedby="cAreaE"><p class="err" id="cAreaE"></p></div>':'<p class="small">Pickup from the studio in <i class="ph">Osu, Accra</i>. We message you when it’s ready. <span class="tbc">Location TBC</span></p>')+
      '<div class="field"><span class="lbl" id="pmL">Pay with</span><div class="paytabs" id="pm" role="radiogroup" aria-labelledby="pmL"><button type="button" class="paytile" role="radio" data-v="momo" aria-checked="'+(st.m==='momo')+'">Mobile Money<small>MTN · Telecel · AirtelTigo</small></button><button type="button" class="paytile" role="radio" data-v="card" aria-checked="'+(st.m==='card')+'">Card<small>Visa · Mastercard · abroad</small></button></div></div>'+
      (st.m==='momo'?'<div class="field"><span class="lbl" id="ntL">Network</span><div class="nets" id="net" role="radiogroup" aria-labelledby="ntL">'+['MTN','Telecel','AirtelTigo'].map(function(x){return '<button type="button" class="chip" role="radio" data-v="'+x+'" aria-checked="'+(st.net===x)+'">'+x+'</button>'}).join('')+'</div></div><div class="field"><label for="mmN">MoMo number</label><input class="input mono" id="mmN" inputmode="tel" placeholder="Same as phone if blank" value="'+esc(st.momo)+'" aria-describedby="mmNE"><p class="err" id="mmNE"></p></div>'
        :'<p class="small">Card details go into the Paystack popup, never into this site. <span class="tbc">Paystack account TBC</span></p>')+
      '<div class="sum"><div><span>Subtotal</span><span class="mono">'+JT.fmt(total)+'</span></div><div><span>'+(st.ship==='delivery'?'Delivery':'Pickup')+'</span><span class="mono">'+(st.ship==='delivery'?'<i class="ph">'+JT.fmt(35)+'</i>':'Free')+'</span></div><div class="tot"><span>Total</span><span>'+JT.fmt(total+(st.ship==='delivery'&&n?35:0))+'</span></div></div>'+
      '<button class="btn btn--red btn--block" id="payBtn" type="button"'+(n?'':' disabled')+'>Pay '+JT.fmt(total+(st.ship==='delivery'&&n?35:0))+'</button>'+
      '<p class="small">Mock checkout: no payment is taken. <a id="cartWa" target="_blank" rel="noopener" href="#">Or send the order on WhatsApp</a></p></aside></div></div>'+
      '<div class="sheet" id="sheet" hidden><div class="sheet__in" role="dialog" aria-modal="true" aria-labelledby="shH"><p class="eyebrow"><span class="eyebrow__no">MOCK</span>Paystack popup</p><h2 id="shH" class="h3">Confirm payment</h2><div class="mockpay">This stands in for the Paystack popup. On the real site '+(st.m==='momo'?'a prompt goes to the '+st.net+' number to approve with your PIN':'you enter your card in Paystack')+'. <b>No money moves in this mockup.</b></div><div class="sum"><div class="tot"><span>Amount</span><span>'+JT.fmt(total+(st.ship==='delivery'?35:0))+'</span></div></div><button class="btn btn--red btn--block" id="mockOk" type="button">Approve (mock)</button><button class="btn btn--block" id="mockNo" type="button">Cancel</button></div></div>';
    $$('.lines [data-a]',el).forEach(function(b){b.addEventListener('click',function(){lineAction(b.dataset.k,b.dataset.a);render();var f=$('.lines [data-k="'+b.dataset.k+'"][data-a="'+b.dataset.a+'"]',el);if(f)f.focus()})});
    [['cName','name'],['cPhone','phone'],['cArea','area'],['mmN','momo']].forEach(function(f){var i=$('#'+f[0],el);if(i)i.addEventListener('input',function(){st[f[1]]=i.value;save();if(i.getAttribute('aria-invalid')){i.removeAttribute('aria-invalid');$('#'+f[0]+'E',el).textContent=''}})});
    radioGroup($('#ship',el),'.chip',function(b){st.ship=b.dataset.v;save();render();$('#ship [aria-checked=true]',el).focus()});
    radioGroup($('#pm',el),'.paytile',function(b){st.m=b.dataset.v;save();render();$('#pm [aria-checked=true]',el).focus()});
    if($('#net',el))radioGroup($('#net',el),'.chip',function(b){st.net=b.dataset.v;save()});
    $('#cartWa',el).href=JT.wa('Hello NO NAME, I would like to order: '+JT.cart.map(function(l){return l.qty+' x '+l.name+(l.jt?' ('+l.jt+')':'')}).join('; ')+'.');
    var sh=$('#sheet',el);
    var first;
    function bad(id,msg){var i=$('#'+id,el);i.setAttribute('aria-invalid','true');$('#'+id+'E',el).textContent=msg;first=first||i}
    $('#payBtn',el).addEventListener('click',function(){
      var digits=function(v){return (v||'').replace(/\D/g,'')};first=null;
      if(!st.name.trim())bad('cName','Add your name so we know whose job it is.');
      if(digits(st.phone).length<9)bad('cPhone','Enter a phone number we can send the proof to.');
      if(st.ship==='delivery'&&!st.area.trim())bad('cArea','Tell the rider where to go.');
      if(st.m==='momo'&&st.momo&&digits(st.momo).length<9)bad('mmN','That MoMo number looks short.');
      if(first){first.focus();return}
      sh.hidden=false;$('#mockOk',el).focus();
    });
    $('#mockNo',el).addEventListener('click',function(){sh.hidden=true;$('#payBtn',el).focus()});
    sh.addEventListener('keydown',function(e){if(e.key==='Escape'){sh.hidden=true;$('#payBtn',el).focus()}});
    $('#mockOk',el).addEventListener('click',function(){
      var jt=(JT.cart.filter(function(l){return l.jt})[0]||{}).jt||JT.newJob();
      var orders=store.get('nn_orders',{});orders[jt]={at:Date.now(),items:JT.cart.length};store.set('nn_orders',orders);
      JT.cart=[];JT.saveCart();location.hash='#/track?jt='+jt+'&new=1';
    });
  }
  render();
}

/* =================== TRACK =================== */
function track(el,q){
  var jt=(q.jt||'').toUpperCase().trim(),isNew=q.new==='1';
  if(/^\d{3,5}$/.test(jt))jt=C.jobPrefix+jt;
  el.innerHTML='<div class="wrap"><header class="pagehead"><p class="eyebrow"><span class="eyebrow__no">04</span>Out the door</p><h1 class="display">Track a job</h1><p class="lede">Your job number is on your proof and your receipt. It starts with '+C.jobPrefix+'</p></header><div class="track">'+
    '<form class="card trackcard" id="tf" novalidate><div class="field"><label for="tJt">Job number</label><input class="input mono" id="tJt" value="'+esc(jt)+'" placeholder="NN-0427" autocomplete="off" aria-describedby="tJtE"><p class="err" id="tJtE"></p></div><div class="field"><label for="tPh">Phone used on the order</label><input class="input mono" id="tPh" inputmode="tel" placeholder="024 000 0000" autocomplete="tel"></div><button class="btn btn--ink" type="submit">Look it up '+ARROW+'</button><p class="small">Mockup: any job number shows a sample status.</p></form>'+
    '<div class="trackres" id="tRes" aria-live="polite"></div></div></div>';
  $('#tf',el).addEventListener('submit',function(e){e.preventDefault();var v=$('#tJt',el).value.trim();if(!v){$('#tJt',el).setAttribute('aria-invalid','true');$('#tJtE',el).textContent='Enter the job number from your proof, like NN-0427.';$('#tJt',el).focus();return}location.hash='#/track?jt='+encodeURIComponent(v)});
  if(!jt){$('#tRes',el).innerHTML='<div class="empty"><p class="h3">Enter a job number</p><p class="small">You’ll see where it is: proof, press or out the door.</p></div>';return}
  var rows=isNew?[['Payment','Received (mock)','Paid'],['Proof','We send your proof on WhatsApp. Reply OK to lock it in.',null],['Press','Starts after your OK',null],['Out the door','Delivery or pickup',null]]
                :[['Proof','Approved on WhatsApp','Proof OK'],['Press','On the press now','Pressed'],['Out the door','Rider assigned <span class="tbc">TBC</span>',null]];
  $('#tRes',el).innerHTML=(isNew?'<div class="docket"><div class="docket__head"><span>Order placed · Job Nº</span><strong>'+esc(jt)+'</strong></div><p style="margin-top:14px;font:600 16px/1.4 var(--sans)">Keep this number. It’s on your WhatsApp proof too.</p></div>':'')+
    '<p class="eyebrow"><span class="eyebrow__no">'+esc(jt)+'</span>Sample status</p><ol class="stages">'+rows.map(function(r,i){return '<li><span class="n">0'+(i+1)+'</span><span><b>'+r[0]+'</b><span class="small">'+r[1]+'</span></span>'+(r[2]?'<span class="stamp is-landing" style="animation-delay:'+(i*.25)+'s">'+r[2]+'</span>':'<span class="pending">Pending</span>')+'</li>'}).join('')+'</ol>';
}

/* =================== BULK =================== */
function bulk(el){
  var st=store.get('nn_bulk',{b:'tee',q:50,pos:{front:true,back:false,sleeve:false}});
  var tiers=[[10,0],[25,.08],[50,.15],[100,.22],[250,.28]];
  el.innerHTML='<div class="wrap"><header class="pagehead"><p class="eyebrow"><span class="eyebrow__no">07</span>Schools · churches · events · companies</p><h1 class="display">Bulk orders</h1><p class="lede">Work out a rough number in ten seconds, then send the request. We reply with a real quote.</p></header><div class="bulk">'+
    '<div class="card calc"><div class="field"><span class="lbl" id="bbL">Item</span><div class="nets" id="bB" role="radiogroup" aria-labelledby="bbL">'+Object.keys(B).map(function(k){return '<button type="button" class="chip" role="radio" data-v="'+k+'" aria-checked="'+(k===st.b)+'">'+B[k].name+'</button>'}).join('')+'</div></div>'+
    '<div class="field"><label for="bQ">Quantity</label><div class="qtyread"><strong id="bQo">'+st.q+'</strong><div class="stepper" role="group" aria-label="Adjust quantity by 5"><button type="button" data-d="-5" aria-label="5 fewer">−</button><button type="button" data-d="5" aria-label="5 more">+</button></div></div><input class="slider" type="range" id="bQ" min="10" max="500" step="5" value="'+st.q+'"></div>'+
    '<div class="field"><span class="lbl" id="bpL">Print positions</span><div class="nets" role="group" aria-labelledby="bpL">'+['front','back','sleeve'].map(function(k){return '<button type="button" class="chip" data-p="'+k+'" aria-pressed="'+!!st.pos[k]+'">'+k[0].toUpperCase()+k.slice(1)+'</button>'}).join('')+'</div></div>'+
    '<table class="breaks"><caption class="sr">Sample price breaks</caption><thead><tr><th scope="col">Qty</th><th scope="col">Discount</th><th scope="col">Per piece</th></tr></thead><tbody id="bT"></tbody></table><p class="small">Sample price breaks. <span class="tbc">Real breaks and minimums TBC</span></p></div>'+
    '<div style="display:grid;gap:20px;align-content:start"><div class="quote" aria-live="polite" id="bOut"></div>'+
    '<form class="card trackcard" id="bF" novalidate><h2 class="h3">Request a quote</h2><div class="field"><label for="bN">Your name</label><input class="input" id="bN" autocomplete="name" aria-describedby="bNE"><p class="err" id="bNE"></p></div><div class="row2"><div class="field"><label for="bO">Organisation</label><select class="input" id="bO"><option>School</option><option>Church</option><option>Event</option><option>Company</option><option>Team or club</option><option>Other</option></select></div><div class="field"><label for="bD">Needed by</label><input class="input" type="date" id="bD"></div></div><a class="btn btn--red" id="bSend" target="_blank" rel="noopener" href="#"><svg class="i" aria-hidden="true"><use href="#i-chat"/></svg>Send request on WhatsApp</a><p class="small">Opens WhatsApp with your details filled in. <span class="tbc">Number TBC</span></p></form></div></div></div>';
  function pos(){return Object.keys(st.pos).filter(function(k){return st.pos[k]})}
  function draw(){
    store.set('nn_bulk',st);
    var base=B[st.b].price+Math.max(1,pos().length)*C.printPerElement,tier=tiers.filter(function(t){return st.q>=t[0]}).pop(),unit=base*(1-tier[1]);
    var s=$('#bQ',el);$('#bQo',el).textContent=st.q;s.value=st.q;s.setAttribute('aria-valuetext',st.q+' pieces');JT.fillSlider(s);
    $('#bT',el).innerHTML=tiers.map(function(t,i){var nx=tiers[i+1];return '<tr class="'+(t===tier?'is-on':'')+'"><td>'+t[0]+(nx?'–'+(nx[0]-1):'+')+'</td><td>'+(t[1]?'−'+Math.round(t[1]*100)+'%':'—')+'</td><td>'+JT.fmt(base*(1-t[1]))+'</td></tr>'}).join('');
    $('#bOut',el).innerHTML='<span class="lbl">Sample estimate</span><strong>'+JT.fmt(unit*st.q)+'</strong><span>'+st.q+' × '+B[st.b].name+' · '+(pos().join(' + ')||'front')+' · '+JT.fmt(unit)+' each</span><span class="small">Not a quote. Real prices come back on WhatsApp.</span>';
    $('#bSend',el).href=JT.wa('Bulk quote request: '+st.q+' x '+B[st.b].name+', print '+(pos().join(' + ')||'front')+'. Name: '+($('#bN',el).value||'-')+'. Organisation: '+$('#bO',el).value+'. Needed by: '+($('#bD',el).value||'-')+'.');
  }
  radioGroup($('#bB',el),'.chip',function(b){st.b=b.dataset.v;draw()});
  $('#bQ',el).addEventListener('input',function(e){st.q=+e.target.value;draw()});
  $$('.qtyread .stepper button',el).forEach(function(b){b.addEventListener('click',function(){st.q=Math.max(10,Math.min(500,st.q+(+b.dataset.d)));draw()})});
  $$('[data-p]',el).forEach(function(b){b.addEventListener('click',function(){st.pos[b.dataset.p]=!st.pos[b.dataset.p];if(!pos().length)st.pos.front=true;$$('[data-p]',el).forEach(function(x){x.setAttribute('aria-pressed',!!st.pos[x.dataset.p])});draw()})});
  $$('#bF input,#bF select',el).forEach(function(i){i.addEventListener('input',function(){if(i.id==='bN'&&i.value.trim()){i.removeAttribute('aria-invalid');$('#bNE',el).textContent=''}draw()})});
  $('#bSend',el).addEventListener('click',function(e){var n=$('#bN',el);if(!n.value.trim()){e.preventDefault();n.setAttribute('aria-invalid','true');$('#bNE',el).textContent='Add your name so we know who to reply to.';n.focus()}});
  draw();
}

/* =================== INFO + 404 =================== */
var INFO={
  delivery:['Delivery','<p>Riders deliver across <i class="ph">Accra and Tema</i>, usually the day after your job leaves the press. Other regions go by courier in <i class="ph">2 to 3 days</i>. Diaspora orders ship by air. <span class="tbc">Areas, fees and couriers TBC</span></p><p>You can also pick up from the studio in <i class="ph">Osu</i>. We message you on WhatsApp when it’s ready.</p>'],
  returns:['Returns','<p>Anything printed with your design is made for you, so it can’t be returned unless we got it wrong. If the print is faulty or doesn’t match the approved proof, message us within <i class="ph">7 days</i> and we reprint it.</p><p>Plain blanks can be returned unworn within <i class="ph">14 days</i>. <span class="tbc">Policy TBC with client</span></p>'],
  privacy:['Privacy','<p>We use your name, phone number and address to make and deliver your order, and to send your proof on WhatsApp. Uploaded images are only used to print your job. Payments are handled by Paystack and we never see your card details.</p><p><span class="tbc">Full privacy notice TBC</span></p>'],
  terms:['Terms','<p>Prices shown on this site are samples. A job is confirmed when you approve the proof and payment is received. Make sure you have the right to print anything you upload. <span class="tbc">Full terms TBC</span></p>']
};
function info(el,id){
  var d=INFO[id];if(!d){notFound(el);return}
  el.innerHTML='<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">'+d[0]+'</span></nav><header class="pagehead"><p class="eyebrow"><span class="eyebrow__no">i</span>Help</p><h1 class="display">'+d[0]+'</h1></header><div class="prose">'+d[1]+'<p><a class="link" data-wa="Hello NO NAME, I have a question about '+d[0].toLowerCase()+'." target="_blank" rel="noopener" href="#">Ask us on WhatsApp</a></p></div></div>';
  waLinks();
}
function notFound(el,msg){
  el.innerHTML='<div class="wrap nf"><p class="eyebrow"><span class="eyebrow__no">404</span>Page not found</p><h1 class="display">Nothing printed <span class="o">here.</span></h1><p class="lede">'+(msg||'This page has no name. Like us, but less useful.')+'</p><div class="nf__row"><a class="btn btn--red" href="#/">Back home</a><a class="btn" href="#/shop">Shop the rail</a><a class="btn" href="#/studio">Open the Studio</a></div></div>';
  document.title='Page not found · NO NAME (mockup)';
}

/* =================== STUDIO (lazy) =================== */
function studio(el,q){
  if(JT.studio){JT.studio.mount(el,q);return}
  el.innerHTML='<div class="wrap" style="min-height:120vh"><p class="small" style="padding:40px 0">Loading the Studio…</p></div>';
  var s=document.createElement('script');s.src='js/studio.js';s.onload=function(){JT.studio.mount(el,q)};document.body.appendChild(s);
}

/* =================== ROUTER =================== */
var titles={home:'We left our name off',shop:'Shop',product:'Product',studio:'Studio',cart:'Cart',track:'Track a job',bulk:'Bulk orders',info:'Help',notfound:'Page not found'};
var first=true,lastV=null,lastId=null;
function parse(){
  var h=location.hash.replace(/^#/,'');if(h.indexOf('/')!==0)h='/';
  var parts=h.split('?'),path=parts[0].split('/').filter(Boolean),q={};
  (parts[1]||'').split('&').forEach(function(kv){if(!kv)return;var p=kv.split('=');q[decodeURIComponent(p[0])]=decodeURIComponent((p[1]||'').replace(/\+/g,' '))});
  return {v:path[0]||'home',id:path[1],q:q};
}
function route(keep){
  if(location.hash && location.hash.indexOf('#/')!==0)return; // in-page anchors (#main)
  var r=parse(),v=(titles[r.v]&&r.v!=='notfound')?r.v:'notfound';
  var same=!first&&v===lastV&&r.id===lastId;
  if(same&&keep!==true)keep='soft';
  var run=function(){render(v,r,keep)};
  if(!first&&!same&&keep!==true&&document.startViewTransition&&!RM)document.startViewTransition(run);else run();
}
function render(v,r,keep){
  var el=$('[data-view="'+v+'"]');
  closeMenu();if(keep!==true)closeDrawer(true);
  if(JT.studio&&JT.studio.unmount&&v!=='studio')JT.studio.unmount();
  if(v!=='home')heroStop();
  $$('[data-view]').forEach(function(x){x.hidden=x!==el});
  document.title=titles[v]+' · NO NAME (mockup)';
  if(v==='home')home(keep===true);else if(v==='shop')shop(el,r.q);else if(v==='product')product(el,r.q,r.id);else if(v==='cart')cart(el);else if(v==='track')track(el,r.q);else if(v==='bulk')bulk(el);else if(v==='studio')studio(el,r.q);else if(v==='info')info(el,r.id);else notFound(el);
  $$('.nav a,.menu nav a').forEach(function(a){var t=a.getAttribute('href').replace('#/','').split('?')[0]||'home';if(t===v||(v==='product'&&t==='shop'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  if(keep!==true&&keep!=='soft'){window.scrollTo({top:0,left:0,behavior:'instant'});if(!first)$('#main').focus({preventScroll:true})}
  if(refocus){var f=$(refocus,el);if(f)f.focus({preventScroll:true});refocus=null}
  lastV=v;lastId=r.id;first=false;root.classList.add('routed');
  reveal(keep===true);
}
JT.route=route;
var hdr=$('#hdr');
function hdrH(){root.style.setProperty('--hdr',hdr.offsetHeight+'px')}
window.addEventListener('resize',hdrH);hdrH();
window.addEventListener('scroll',function(){hdr.classList.toggle('is-scrolled',window.scrollY>4)},{passive:true});
window.addEventListener('hashchange',function(){route()});
route();
JT.ready=true;
})();
