/* The Studio: "Pull a proof". Vanilla canvas designer, ~loaded only on #/studio. */
(function(){
'use strict';
var $=JT.$,$$=JT.$$,B=JT.blanks,C=JT.config,esc=JT.esc,store=JT.store;
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var INKS=[['#141311','Press black'],['#F7F5EF','White'],['#C2301A','Spot red'],['#F2C230','Yellow'],['#24324D','Navy'],['#2E5E3E','Green']];
var S,hist=[],el,cv,ctx,k=1,pointers={},gest=null,saveT,imgCache={},tab='blank',BG='#E5E0D3',ARROW=JT.ARROW;

function fresh(q){
  var s={blank:B[q.blank]?q.blank:'tee',colour:JT.colours.some(function(c){return c.id===q.colour})?q.colour:'white',side:'front',sides:{front:[],back:[]},sel:0,qty:1,jt:null,proofed:false};
  var hex=JT.colour(s.colour).hex;
  s.sides.front.push({type:'text',text:(q.text||'YOUR MARK').toUpperCase().slice(0,24),font:'cond',col:JT.inkFor(hex)==='#141311'?'#C2301A':'#F2C230',u:.5,v:.38,s:.72,r:0});
  return s;
}
function layers(){return S.sides[S.side]}
function cur(){var l=layers();return S.sel!=null?l[S.sel]:null}
function area(){return B[S.blank].area}
function count(){return S.sides.front.length+S.sides.back.length}
function unit(){return B[S.blank].price+count()*C.printPerElement}
function hasBack(){return S.blank==='tee'||S.blank==='hoodie'}

/* ---------- history + autosave ---------- */
function snap(){return JSON.stringify({blank:S.blank,colour:S.colour,sides:S.sides,side:S.side,qty:S.qty})}
function push(){var s=snap();if(hist[hist.length-1]!==s){hist.push(s);if(hist.length>40)hist.shift()}}
function changed(noHist){
  if(!noHist)push();
  if(S.proofed){S.proofed=false;$('.press',el).classList.remove('is-proofed');live('Design changed. Pull a new proof.')}
  save();draw();ticket();
}
function save(){clearTimeout(saveT);saveT=setTimeout(function(){var o=JSON.parse(snap());o.jt=S.jt;try{localStorage.setItem('nn_studio',JSON.stringify(o))}catch(e){/* big uploads: skip */}},300)}
function undo(){if(hist.length<2){JT.toast('Nothing to undo');return}hist.pop();var o=JSON.parse(hist[hist.length-1]);S.blank=o.blank;S.colour=o.colour;S.sides=o.sides;S.side=o.side;S.qty=o.qty;S.sel=layers().length?0:null;syncUI();changed(true)}

/* ---------- geometry ---------- */
function geo(L){
  var a=area(),cx=a[0]+L.u*a[2],cy=a[1]+L.v*a[3],w,h;
  if(L.type==='text'){var fs=L.s*a[2]*.5;ctx.save();setFont(ctx,L,fs);w=Math.max(ctx.measureText(L.text||' ').width,10);ctx.restore();h=fs*.92;return {cx:cx,cy:cy,w:w,h:h,fs:fs}}
  w=L.s*a[2];h=L.type==='image'?w*L.nh/L.nw:w;return {cx:cx,cy:cy,w:w,h:h};
}
function fit(L){if(L.type!=='text')return L;var a=area(),g=geo(L);if(g.w>a[2]*.94)L.s=L.s*a[2]*.94/g.w;return L}
function setFont(c,L,fs){var f=JT.fonts.filter(function(x){return x.id===L.font})[0]||JT.fonts[0];c.font=f.css.replace('{s}',fs.toFixed(1));try{c.fontStretch=f.stretch}catch(e){}}

/* ---------- render ---------- */
function render(c,K,o){
  var b=B[S.blank],hex=JT.colour(S.colour).hex,edge=JT.mix(hex,'#000000',.42),dark=JT.lum(hex)<.4;
  c.setTransform(K,0,0,K,0,0);c.clearRect(0,0,400,400);
  c.fillStyle=BG;c.fillRect(0,0,400,400);
  // ground shadow
  c.save();c.translate(200,b.floor);c.scale(1,13/b.fw);var fl=c.createRadialGradient(0,0,0,0,0,b.fw);fl.addColorStop(0,'rgba(60,42,20,.3)');fl.addColorStop(1,'rgba(60,42,20,0)');c.fillStyle=fl;c.beginPath();c.arc(0,0,b.fw,0,Math.PI*2);c.fill();c.restore();
  c.lineJoin='round';c.lineCap='round';
  b.details.forEach(function(d){if(d.k==='strap'){var p=new Path2D(d.d);c.strokeStyle=edge;c.lineWidth=16;c.stroke(p);c.strokeStyle=hex;c.lineWidth=11;c.stroke(p)}});
  var body=new Path2D(b.body);c.fillStyle=hex;c.fill(body);c.strokeStyle=edge;c.lineWidth=2.5;c.stroke(body);
  b.details.forEach(function(d){var p=new Path2D(d.d);
    if(d.k==='shade'){c.fillStyle=JT.mix(hex,'#000000',.15);c.fill(p);c.lineWidth=2;c.strokeStyle=edge;c.stroke(p)}
    if(d.k==='line'){c.save();c.setLineDash([4,3.5]);c.strokeStyle=dark?'rgba(255,255,255,.24)':'rgba(20,19,17,.26)';c.lineWidth=1.6;c.stroke(p);c.restore()}});
  if(S.side==='back'){c.font='500 13px "Plex Mono", monospace';c.fillStyle='#5F5A51';c.textAlign='center';c.fillText('BACK VIEW',200,390)}
  var a=b.area;
  if(o.design!==false){
    c.save();c.beginPath();c.rect(a[0],a[1],a[2],a[3]);c.clip();
    layers().forEach(function(L){drawLayer(c,L)});
    c.restore();
  }
  // fabric light over body and print, same direction as the site's SVGs
  var sh=c.createLinearGradient(60,40,340,370);sh.addColorStop(0,'rgba(255,255,255,.24)');sh.addColorStop(.42,'rgba(255,255,255,0)');sh.addColorStop(.7,'rgba(0,0,0,.04)');sh.addColorStop(1,'rgba(0,0,0,.24)');c.fillStyle=sh;c.fill(body);
  if(o.area){c.save();c.setLineDash([6,5]);c.lineWidth=1.5;c.strokeStyle=JT.inkFor(hex)==='#141311'?'rgba(20,19,17,.6)':'rgba(247,245,239,.7)';c.strokeRect(a[0],a[1],a[2],a[3]);c.restore()}
  if(o.sel&&cur()){var L=cur(),g=geo(L);c.save();c.translate(g.cx,g.cy);c.rotate(L.r*Math.PI/180);c.setLineDash([5,4]);c.lineWidth=2;c.strokeStyle='#D9381E';c.strokeRect(-g.w/2-6,-g.h/2-6,g.w+12,g.h+12);c.setLineDash([]);c.fillStyle='#D9381E';[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(p){c.fillRect(p[0]*(g.w/2+6)-4,p[1]*(g.h/2+6)-4,8,8)});c.restore()}
}
function drawLayer(c,L){
  var g=geo(L);c.save();c.translate(g.cx,g.cy);c.rotate(L.r*Math.PI/180);
  if(L.type==='text'){setFont(c,L,g.fs);c.fillStyle=L.col;c.textAlign='center';c.textBaseline='middle';c.fillText(L.text,0,g.fs*.04)}
  else if(L.type==='art'){var a=JT.arts.filter(function(x){return x.id===L.art})[0];c.scale(g.w/100,g.w/100);c.translate(-50,-50);c.fillStyle=L.col;c.fill(new Path2D(a.d),'evenodd')}
  else if(L.type==='image'){var im=imgCache[L.src];if(!im){im=new Image();im.onload=function(){draw()};im.src=L.src;imgCache[L.src]=im}if(im.complete&&im.naturalWidth)c.drawImage(im,-g.w/2,-g.h/2,g.w,g.h)}
  c.restore();
}
function draw(){if(!cv)return;render(ctx,k,{area:!S.proofed,sel:!S.proofed});}
function size(){var r=cv.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2),px=Math.round(Math.max(r.width,200)*d);if(cv.width!==px){cv.width=cv.height=px}k=px/400;draw()}
function exportURL(px,type){var c=document.createElement('canvas');c.width=c.height=px;var x=c.getContext('2d');render(x,px/400,{area:false,sel:false});return c.toDataURL(type||'image/png',.82)}

/* ---------- pointer: drag, pinch, rotate ---------- */
function pt(e){var r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*400,y:(e.clientY-r.top)/r.height*400}}
function hit(p){var l=layers();for(var i=l.length-1;i>=0;i--){var g=geo(l[i]),a=-l[i].r*Math.PI/180,dx=p.x-g.cx,dy=p.y-g.cy,lx=dx*Math.cos(a)-dy*Math.sin(a),ly=dx*Math.sin(a)+dy*Math.cos(a);if(Math.abs(lx)<=g.w/2+10&&Math.abs(ly)<=g.h/2+10)return i}return null}
function onDown(e){
  if(S.proofed){S.proofed=false;$('.press',el).classList.remove('is-proofed');ticket()}
  cv.setPointerCapture(e.pointerId);pointers[e.pointerId]=pt(e);var ids=Object.keys(pointers);
  if(ids.length===1){var i=hit(pointers[e.pointerId]);S.sel=i;syncLayers();if(i!=null){var L=cur(),a=area();gest={t:'drag',sx:pointers[e.pointerId].x,sy:pointers[e.pointerId].y,u:L.u,v:L.v,a:a}}else gest=null;draw()}
  else if(ids.length===2&&cur()){var p1=pointers[ids[0]],p2=pointers[ids[1]];gest={t:'pinch',d:Math.hypot(p2.x-p1.x,p2.y-p1.y),ang:Math.atan2(p2.y-p1.y,p2.x-p1.x),s:cur().s,r:cur().r}}
}
function onMove(e){
  if(!pointers[e.pointerId]||!gest)return;pointers[e.pointerId]=pt(e);var L=cur();if(!L)return;
  if(gest.t==='drag'){var p=pointers[e.pointerId];L.u=clamp(gest.u+(p.x-gest.sx)/gest.a[2],0,1);L.v=clamp(gest.v+(p.y-gest.sy)/gest.a[3],0,1)}
  else{var ids=Object.keys(pointers);if(ids.length<2)return;var p1=pointers[ids[0]],p2=pointers[ids[1]];L.s=clamp(gest.s*Math.hypot(p2.x-p1.x,p2.y-p1.y)/gest.d,.08,2);L.r=Math.round(gest.r+(Math.atan2(p2.y-p1.y,p2.x-p1.x)-gest.ang)*180/Math.PI)}
  gest.moved=true;draw();syncArrange();
}
function onUp(e){delete pointers[e.pointerId];if(gest&&gest.moved)changed();if(!Object.keys(pointers).length)gest=null}
function onKey(e){
  var L=cur();if(!L)return;var st=e.shiftKey?.05:.01,h=true;
  switch(e.key){case 'ArrowLeft':L.u=clamp(L.u-st,0,1);break;case 'ArrowRight':L.u=clamp(L.u+st,0,1);break;case 'ArrowUp':L.v=clamp(L.v-st,0,1);break;case 'ArrowDown':L.v=clamp(L.v+st,0,1);break;
    case '+':case '=':L.s=clamp(L.s*1.06,.08,2);break;case '-':L.s=clamp(L.s/1.06,.08,2);break;case ']':L.r+=5;break;case '[':L.r-=5;break;case 'Delete':case 'Backspace':del();return e.preventDefault();default:h=false}
  if(h){e.preventDefault();changed();syncArrange()}
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

/* ---------- actions ---------- */
function add(L){fit(L);layers().push(L);S.sel=layers().length-1;syncLayers();syncArrange();changed();live('Added '+label(L)+'. Drag it on the '+B[S.blank].name+' or use Arrange.')}
function del(){var l=layers();if(S.sel==null||!l[S.sel])return;var L=l.splice(S.sel,1)[0];S.sel=l.length?l.length-1:null;syncLayers();syncArrange();changed();live('Removed '+label(L))}
function label(L){return L.type==='text'?'text "'+L.text+'"':L.type==='art'?(JT.arts.filter(function(a){return a.id===L.art})[0].name+' art'):'uploaded image'}
function live(m){var r=$('#stLive',el);if(r)r.textContent=m}

/* ---------- proof ---------- */
function pull(){
  if(!count()){JT.toast('Add your mark first: text, art or an upload.');return}
  S.sel=null;syncLayers();
  var press=$('.press',el),img=$('.press__proof img',el);
  img.src=exportURL(cv.width);
  press.classList.remove('is-proofed','is-pulling');
  render(ctx,k,{design:false,area:false,sel:false});           // the blank under the screen
  void press.offsetWidth;press.classList.add('is-pulling');
  $('#pullBtn',el).disabled=true;$('#pullBtn2',el).disabled=true;
  setTimeout(function(){
    press.classList.remove('is-pulling');
    if(!S.jt)S.jt=JT.newJob();S.proofed=true;press.classList.add('is-proofed');
    $('.press__stamp',el).textContent='Proof · '+S.jt;
    $('#pullBtn',el).disabled=false;$('#pullBtn2',el).disabled=false;
    draw();ticket();save();
    live('Proof pulled. Job number '+S.jt+'. Price '+JT.fmt(unit()*S.qty)+', sample.');
    if(window.innerWidth<1000){var t=$('#stTicket',el);if(t)t.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})}
  },RM?30:1150);
}
function addCart(){
  var hex=JT.colour(S.colour);
  var c=document.createElement('canvas');c.width=c.height=200;render(c.getContext('2d'),.5,{area:false,sel:false});
  JT.addToCart({kind:'custom',blank:S.blank,colour:S.colour,qty:S.qty,unit:unit(),name:'Custom '+B[S.blank].name.toLowerCase(),jt:S.jt,thumb:c.toDataURL('image/jpeg',.8),desc:count()+' print element'+(count()>1?'s':'')+(S.sides.back.length&&S.sides.front.length?', front + back':'')});
}

/* ---------- UI ---------- */
function blankSVG(id){return JT.blankSVG(id,JT.colour(S.colour).hex,null,{label:''})}
function inkSw(name){return '<div class="swatches" role="radiogroup" aria-label="'+name+'" data-ink>'+INKS.map(function(i){return '<button type="button" class="swatch swatch--sm" role="radio" aria-checked="false" aria-label="'+i[1]+'" data-v="'+i[0]+'" style="--c:'+i[0]+'"><i></i></button>'}).join('')+'</div>'}
function shell(){
  el.innerHTML='<div class="wrap studio"><div class="studio__head"><div><p class="eyebrow"><span class="eyebrow__no">01</span>Your mark · Proof</p><h1>The Studio</h1></div><p class="small">Pick a blank, put your mark on it, then pull a proof. It saves as you go, on this device.</p></div>'+
  '<div class="studio__body">'+
  '<div class="studio__canvas"><div class="pressbar"><div class="press__sides" id="sides" role="tablist" aria-label="Print side"></div><div class="press__tools"><button class="btn btn--sm" id="undo" type="button">Undo</button><button class="btn btn--sm" id="delB" type="button" aria-label="Delete selected layer">Delete</button></div></div><div class="press halftone"><canvas id="cv" width="400" height="400" tabindex="0" role="img" aria-label="Design canvas. Select a layer, then use arrow keys to move, plus and minus to resize, square brackets to rotate, Delete to remove."></canvas>'+
    '<div class="press__proof" aria-hidden="true"><img alt=""><span class="press__blade"></span></div>'+
    '<span class="stamp stamp--big press__stamp" aria-hidden="true">Proof</span>'+
    '<p class="press__hint" id="hint">Drag to move · two fingers to scale and turn</p></div></div>'+
  '<div class="tray"><div class="tabs" role="tablist" aria-label="Studio tools">'+[['blank','Blank'],['text','Text'],['art','Art'],['upload','Upload'],['arrange','Layers']].map(function(t){return '<button role="tab" type="button" id="tab-'+t[0]+'" aria-controls="pn-'+t[0]+'" aria-selected="'+(t[0]===tab)+'" data-t="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>'+
    '<div class="panel" role="tabpanel" id="pn-blank" aria-labelledby="tab-blank"><span class="lbl" id="blL">Product</span><div class="blanks" id="blanks" role="radiogroup" aria-labelledby="blL"></div><span class="lbl" id="bcL">Blank colour: <span id="bcN"></span></span><div class="swatches" id="bcol" role="radiogroup" aria-labelledby="bcL">'+JT.colours.map(function(c){return '<button type="button" class="swatch" role="radio" aria-checked="'+(c.id===S.colour)+'" aria-label="'+c.name+'" data-c="'+c.id+'" style="--c:'+c.hex+'"><i></i></button>'}).join('')+'</div><p class="small" style="margin:0">Your design moves with you: switch product and it lands in the new print area. <span class="tbc">Blanks, colours and sizes TBC</span></p></div>'+
    '<div class="panel" role="tabpanel" id="pn-text" aria-labelledby="tab-text" hidden><div class="field"><label for="tIn">Text</label><input class="input" id="tIn" maxlength="24" autocomplete="off" placeholder="Type your line"></div><div class="field"><label for="tFont">Font</label><select class="input" id="tFont">'+JT.fonts.map(function(f){return '<option value="'+f.id+'">'+f.name+'</option>'}).join('')+'</select></div><div class="field"><span class="lbl">Ink colour</span>'+inkSw('Text ink colour')+'</div><button class="btn btn--sm" id="tAdd" type="button">+ Add another line</button><p class="small" style="margin:0">Open-licence fonts only. <span class="tbc">Final font set TBC</span></p></div>'+
    '<div class="panel" role="tabpanel" id="pn-art" aria-labelledby="tab-art" hidden><span class="lbl">Sample art (tap to add)</span><div class="arts">'+JT.arts.map(function(a){return '<button class="art" type="button" data-a="'+a.id+'" aria-label="Add '+a.name+'"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="'+a.d+'" fill="#141311" fill-rule="evenodd"/></svg></button>'}).join('')+'</div><div class="field"><span class="lbl">Ink colour for selected art</span>'+inkSw('Art ink colour')+'</div><p class="small" style="margin:0">Templates for birthdays, churches and businesses will sit here too. <span class="tbc">Art library TBC</span></p></div>'+
    '<div class="panel" role="tabpanel" id="pn-upload" aria-labelledby="tab-upload" hidden><label class="btn btn--ink" for="up" style="cursor:pointer">Upload an image</label><input class="sr" type="file" id="up" accept="image/png,image/jpeg,image/webp"><p class="small" style="margin:0">PNG with a transparent background prints best. It stays on your device in this mockup. <span class="tbc">Upload rules TBC</span></p><div id="dpi"></div></div>'+
    '<div class="panel" role="tabpanel" id="pn-arrange" aria-labelledby="tab-arrange" hidden><span class="lbl" id="lyL">Layers on the '+'<span id="lySide">front</span></span><ul class="layers" id="layers" aria-labelledby="lyL"></ul><div class="field"><label for="aS">Size</label><input class="slider" type="range" id="aS" min="8" max="200" value="40"></div><div class="field"><label for="aR">Rotate</label><input class="slider" type="range" id="aR" min="-180" max="180" value="0"></div><div class="tools"><button class="btn btn--sm" id="aC" type="button">Centre it</button><button class="btn btn--sm" id="aUp" type="button">Bring forward</button></div></div>'+
  '</div>'+
  '<aside class="ticket" id="stTicket" aria-labelledby="tkH"><h2 id="tkH" class="sr">Job ticket</h2><div class="docket"><div class="docket__head"><span>Job Nº</span><strong id="tkNo">'+C.jobPrefix+'____</strong></div><dl class="docket__rows"><div><dt>Item</dt><dd id="tkItem"></dd></div><div><dt>Marks</dt><dd id="tkMarks"></dd></div><div><dt>Proof</dt><dd id="tkProof"></dd></div></dl>'+
    '<div class="docket__foot"><span>Qty</span><div class="stepper stepper--sm" role="group" aria-label="Quantity"><button type="button" data-d="-1" aria-label="One fewer">−</button><output id="tkQ">1</output><button type="button" data-d="1" aria-label="One more">+</button></div></div>'+
    '<div class="ticket__price"><span class="lbl">Live price</span><strong id="tkPrice"></strong></div><p class="small" id="tkBreak" style="margin-top:6px;font-family:var(--sans)"></p></div>'+
    '<button class="btn btn--red btn--block" id="pullBtn" type="button">Pull a proof</button>'+
    '<div class="ticket__after" id="after" hidden><button class="btn btn--ink btn--block" id="cartB" type="button">Add to cart</button><a class="btn btn--block" id="waB" target="_blank" rel="noopener" href="#"><svg class="i" aria-hidden="true"><use href="#i-chat"/></svg>Send proof on WhatsApp</a><a class="btn btn--sm btn--block" id="dlB" href="#" download>Download proof image</a><p class="small">WhatsApp opens with the job number filled in. Attach the downloaded proof image. <span class="tbc">Shop number TBC</span></p></div>'+
  '</aside></div>'+
  '<div class="pullbar"><span id="pbPrice"></span><button class="btn btn--red" id="pullBtn2" type="button">Pull a proof</button></div>'+
  '<p class="sr" id="stLive" role="status" aria-live="polite"></p></div>';
}
function syncUI(){
  $('#blanks',el).innerHTML=Object.keys(B).map(function(id){return '<button type="button" class="blank" role="radio" aria-checked="'+(id===S.blank)+'" data-b="'+id+'">'+blankSVG(id)+B[id].name+'</button>'}).join('');
  JT.radioGroup($('#blanks',el),'.blank',function(b){S.blank=b.dataset.b;if(!hasBack()&&S.side==='back'){S.side='front'}S.sel=layers().length?0:null;sides();syncLayers();changed()});
  $$('#bcol .swatch',el).forEach(function(x){x.setAttribute('aria-checked',String(x.dataset.c===S.colour));x.tabIndex=x.dataset.c===S.colour?0:-1});
  $('#bcN',el).textContent=JT.colour(S.colour).name;
  sides();syncLayers();syncArrange();
}
function sides(){
  var s=$('#sides',el);
  s.innerHTML=hasBack()?['front','back'].map(function(x){return '<button class="chip" role="tab" type="button" aria-selected="'+(x===S.side)+'" data-s="'+x+'">'+x[0].toUpperCase()+x.slice(1)+'</button>'}).join(''):'';
  $$('[data-s]',s).forEach(function(b){b.addEventListener('click',function(){S.side=b.dataset.s;S.sel=layers().length?0:null;sides();syncLayers();syncArrange();draw();live('Now editing the '+S.side)})});
}
function syncLayers(){
  var l=layers();$('#lySide',el).textContent=S.side;
  $('#layers',el).innerHTML=l.length?l.map(function(L,i){return '<li><button type="button" data-i="'+i+'" aria-pressed="'+(i===S.sel)+'"><span>'+esc(label(L))+'</span><span class="mono" aria-hidden="true">'+(i+1)+'</span></button></li>'}).join(''):'<li class="small">Nothing on the '+S.side+' yet.</li>';
  $$('#layers button',el).forEach(function(b){b.addEventListener('click',function(){S.sel=+b.dataset.i;syncLayers();syncArrange();draw()})});
  var L=cur(),t=$('#tIn',el);
  if(L&&L.type==='text'){t.value=L.text;$('#tFont',el).value=L.font}
  else if(document.activeElement!==t)t.value='';
  $$('[data-ink]',el).forEach(function(g){$$('.swatch',g).forEach(function(x){var on=!!L&&L.type!=='image'&&x.dataset.v===L.col;x.setAttribute('aria-checked',String(on))})});
  $('#delB',el).disabled=!L;dpi();
}
function syncArrange(){var L=cur();$('#aS',el).disabled=$('#aR',el).disabled=!L;if(L){$('#aS',el).value=Math.round(L.s*100);$('#aR',el).value=((L.r+180)%360+360)%360-180}JT.fillSlider($('#aS',el));JT.fillSlider($('#aR',el))}
function dpi(){var L=cur(),d=$('#dpi',el);if(!d)return;if(!L||L.type!=='image'){d.innerHTML='';return}var a=area(),inch=L.s*B[S.blank].inches,v=Math.round(L.nw/inch);d.innerHTML=v<150?'<p class="warn" role="alert">Image too small to print sharply at this size ('+v+' dpi). Use a bigger image or make it smaller.</p>':'<p class="small">Print quality OK ('+v+' dpi)</p>'}
function ticket(){
  var b=B[S.blank],n=count(),hasProof=S.proofed;
  $('#tkNo',el).textContent=S.jt||C.jobPrefix+'____';
  $('#tkItem',el).textContent=b.name+' · '+JT.colour(S.colour).name;
  $('#tkMarks',el).textContent=n?(S.sides.front.length+' front'+(hasBack()?' · '+S.sides.back.length+' back':'')):'None yet';
  $('#tkProof',el).textContent=hasProof?'Pulled ✓':(S.jt?'Changed since proof':'Not pulled');
  $('#tkQ',el).textContent=S.qty;
  $('#tkPrice',el).textContent=JT.fmt(unit()*S.qty);
  $('#tkBreak',el).textContent=b.name+' '+JT.fmt(b.price)+' + '+n+' × print '+JT.fmt(C.printPerElement)+(S.qty>1?' · × '+S.qty:'');
  $('#pbPrice',el).innerHTML=JT.priceHTML(unit()*S.qty);
  $('#after',el).hidden=!hasProof;
  $('#pullBtn',el).textContent=S.jt&&!hasProof?'Pull a new proof':hasProof?'Pull again':'Pull a proof';
  $('#pullBtn2',el).textContent=hasProof?'Add to cart':$('#pullBtn',el).textContent;
  $('#pullBtn',el).className=hasProof?'btn btn--block':'btn btn--red btn--block';$('#cartB',el).className=hasProof?'btn btn--red btn--block':'btn btn--ink btn--block';
  if(hasProof){
    $('#waB',el).href=JT.wa('Hello, here is my proof '+S.jt+': '+b.name+' ('+JT.colour(S.colour).name+'), '+n+' print element'+(n>1?'s':'')+', qty '+S.qty+'. Sample price '+JT.fmt(unit()*S.qty)+'. I will attach the proof image. (Sent from mockup site)');
    $('#dlB',el).setAttribute('download','proof-'+S.jt+'.png');
  }
}
function bind(){
  cv=$('#cv',el);ctx=cv.getContext('2d');
  cv.addEventListener('pointerdown',onDown);cv.addEventListener('pointermove',onMove);cv.addEventListener('pointerup',onUp);cv.addEventListener('pointercancel',onUp);
  cv.addEventListener('wheel',function(e){var L=cur();if(!L)return;e.preventDefault();L.s=clamp(L.s*(e.deltaY<0?1.06:1/1.06),.08,2);syncArrange();draw();dpi();save()},{passive:false});
  cv.addEventListener('keydown',onKey);
  $$('.tabs [role=tab]',el).forEach(function(t){t.addEventListener('click',function(){showTab(t.dataset.t)});t.addEventListener('keydown',function(e){var ts=$$('.tabs [role=tab]',el),i=ts.indexOf(t);if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();var n=ts[(i+(e.key==='ArrowRight'?1:-1)+ts.length)%ts.length];n.focus();showTab(n.dataset.t)}})});
  JT.radioGroup($('#bcol',el),'.swatch',function(b){S.colour=b.dataset.c;$('#bcN',el).textContent=JT.colour(S.colour).name;$('#blanks',el).innerHTML=Object.keys(B).map(function(id){return '<button type="button" class="blank" role="radio" aria-checked="'+(id===S.blank)+'" tabindex="'+(id===S.blank?0:-1)+'" data-b="'+id+'">'+blankSVG(id)+B[id].name+'</button>'}).join('');changed()});
  $('#tIn',el).addEventListener('input',function(e){var L=cur(),v=e.target.value.toUpperCase();if(L&&L.type==='text'){var w0=geo(L).w;L.text=v;if(geo(L).w>w0)fit(L);draw();syncLayersSoft();changed()}else if(v){add({type:'text',text:v,font:$('#tFont',el).value,col:JT.inkFor(JT.colour(S.colour).hex),u:.5,v:.45,s:.36,r:0})}});
  $('#tFont',el).addEventListener('change',function(e){var L=cur();if(L&&L.type==='text'){L.font=e.target.value;changed()}});
  $('#tAdd',el).addEventListener('click',function(){add({type:'text',text:'NEW LINE',font:$('#tFont',el).value,col:JT.inkFor(JT.colour(S.colour).hex),u:.5,v:.75,s:.26,r:0});$('#tIn',el).focus();$('#tIn',el).select()});
  $$('[data-ink]',el).forEach(function(g){JT.radioGroup(g,'.swatch',function(b){var L=cur();if(L&&L.type!=='image'){L.col=b.dataset.v;changed()}})});
  $$('[data-a]',el).forEach(function(b){b.addEventListener('click',function(){add({type:'art',art:b.dataset.a,col:JT.inkFor(JT.colour(S.colour).hex)==='#141311'?'#C2301A':'#F2C230',u:.5,v:.78,s:.38,r:0})})});
  $('#up',el).addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var nw=im.naturalWidth,nh=im.naturalHeight,src=r.result;if(Math.max(nw,nh)>1400){var c=document.createElement('canvas'),sc=1400/Math.max(nw,nh);c.width=nw*sc;c.height=nh*sc;c.getContext('2d').drawImage(im,0,0,c.width,c.height);src=c.toDataURL('image/png')}add({type:'image',src:src,nw:nw,nh:nh,u:.5,v:.5,s:.7,r:0});};im.src=r.result};r.readAsDataURL(f);e.target.value=''});
  $('#aS',el).addEventListener('input',function(e){var L=cur();JT.fillSlider(e.target);if(L){L.s=e.target.value/100;draw();dpi()}});$('#aS',el).addEventListener('change',function(){changed()});
  $('#aR',el).addEventListener('input',function(e){var L=cur();JT.fillSlider(e.target);if(L){L.r=+e.target.value;draw()}});$('#aR',el).addEventListener('change',function(){changed()});
  $('#aC',el).addEventListener('click',function(){var L=cur();if(L){L.u=.5;L.v=.5;L.r=0;syncArrange();changed()}});
  $('#aUp',el).addEventListener('click',function(){var l=layers();if(S.sel!=null&&S.sel<l.length-1){var x=l.splice(S.sel,1)[0];l.splice(S.sel+1,0,x);S.sel++;syncLayers();changed()}});
  $('#undo',el).addEventListener('click',undo);$('#delB',el).addEventListener('click',del);
  $('#pullBtn',el).addEventListener('click',pull);$('#pullBtn2',el).addEventListener('click',function(){if(S.proofed)addCart();else pull()});
  $$('#stTicket .stepper button',el).forEach(function(b){b.addEventListener('click',function(){S.qty=clamp(S.qty+(+b.dataset.d),1,999);ticket();save()})});
  $('#cartB',el).addEventListener('click',addCart);
  $('#dlB',el).addEventListener('click',function(){this.href=exportURL(800)});
  window.addEventListener('resize',size);
}
function syncLayersSoft(){$$('#layers button',el).forEach(function(b,i){var L=layers()[i];if(L)b.firstChild.textContent=label(L)})}
function showTab(t){tab=t;$$('.tabs [role=tab]',el).forEach(function(x){var on=x.dataset.t===t;x.setAttribute('aria-selected',String(on));x.tabIndex=on?0:-1});$$('.tray [role=tabpanel]',el).forEach(function(p){p.hidden=p.id!=='pn-'+t})}

JT.studio={
  mount:function(root,q){
    el=root;hist=[];
    BG=getComputedStyle(document.documentElement).getPropertyValue('--stage').trim()||BG;
    var saved=store.get('nn_studio',null);
    if(q.blank||q.text||!saved){S=fresh(q)}else{S={blank:saved.blank,colour:saved.colour,side:saved.side||'front',sides:saved.sides,sel:null,qty:saved.qty||1,jt:saved.jt||null,proofed:false};S.sel=layers().length?0:null}
    if(q.text)tab='text';
    shell();bind();layers().forEach(fit);syncUI();showTab(tab);push();ticket();
    requestAnimationFrame(size);
    if(document.fonts&&document.fonts.load){Promise.all([document.fonts.load('900 40px Archivo'),document.fonts.load('500 20px "Plex Mono"')]).then(function(){draw()},function(){})}
    JT.studio.state=function(){return S};
  },
  unmount:function(){window.removeEventListener('resize',size);cv=null}
};
})();
