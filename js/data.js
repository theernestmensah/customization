/* SAMPLE DATA ONLY. Every price, product, job and rate here is a placeholder for the mockup. */
window.JT = window.JT || {};
JT.config = {
  brand: 'NO NAME',
  jobPrefix: 'NN-',
  whatsapp: '233000000000',          // placeholder: client WhatsApp number TBC
  usdRate: 15,                       // sample: 1 USD = 15 GHS, for display only
  printPerElement: 25,               // sample GHS per print element
  printBack: 30                      // sample GHS when the back is printed
};
/* blanks: 400x400 artboard. area = print area [x,y,w,h]; inches = printable width for DPI warning;
   floor/fw = ground shadow y and half-width */
JT.blanks = {
  tee:   {name:'Tee', noun:'a tee', group:'apparel', price:120, inches:11, floor:362, fw:118,
    desc:'Heavyweight cotton tee with a regular fit. Takes a big front print and a full back.', fabric:'100% cotton, 180 gsm',
    body:'M142 58 L110 68 L38 112 L68 176 L104 160 L104 352 L296 352 L296 160 L332 176 L362 112 L290 68 L258 58 Q248 98 200 98 Q152 98 142 58 Z',
    details:[{d:'M142 58 Q152 98 200 98 Q248 98 258 58 Q240 82 200 82 Q160 82 142 58 Z',k:'shade'},{d:'M104 160 L110 186 M296 160 L290 186',k:'line'},{d:'M108 340 L292 340',k:'line'}],
    area:[146,122,108,150]},
  hoodie:{name:'Hoodie', noun:'a hoodie', group:'apparel', price:280, inches:11, floor:366, fw:126,
    desc:'Brushed-fleece pullover with a kangaroo pocket and a lined hood.', fabric:'80/20 cotton-poly fleece, 300 gsm',
    body:'M150 56 Q200 18 250 56 L302 76 L360 132 L346 262 L310 256 L304 172 L302 356 L98 356 L96 172 L90 256 L54 262 L40 132 L98 76 Z',
    details:[{d:'M164 70 Q200 124 236 70 Q200 46 164 70 Z',k:'shade'},{d:'M138 270 L262 270 L276 336 L124 336 Z',k:'line'},{d:'M186 104 L182 158 M214 104 L218 158',k:'line'}],
    area:[148,126,104,120]},
  cap:   {name:'Cap', noun:'a cap', group:'apparel', price:90, inches:4.5, floor:300, fw:150,
    desc:'Six-panel cap with a curved brim and an adjustable strap. Printed or embroidered on the front panel.', fabric:'Cotton twill',
    body:'M88 252 Q86 122 200 114 Q314 122 312 252 Z',
    details:[{d:'M68 252 Q200 228 362 262 Q372 292 330 294 Q200 270 80 286 Q58 276 68 252 Z',k:'shade'},{d:'M200 114 L200 252 M140 126 Q126 190 128 252 M260 126 Q274 190 272 252',k:'line'},{d:'M192 112 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0',k:'shade'}],
    area:[146,150,108,72]},
  mug:   {name:'Mug', noun:'a mug', group:'gifts', price:70, inches:8, floor:346, fw:110,
    desc:'Ceramic mug, printed round the side. The print goes through the dishwasher.', fabric:'11 oz ceramic',
    body:'M108 104 L272 104 L272 322 Q272 340 254 340 L126 340 Q108 340 108 322 Z',
    details:[{d:'M272 146 Q344 146 344 216 Q344 286 272 286 L272 258 Q314 258 314 216 Q314 174 272 174 Z',k:'shade'},{d:'M108 104 Q190 122 272 104',k:'line'}],
    area:[128,136,124,160]},
  case:  {name:'Phone case', noun:'a phone case', group:'accessories', price:85, inches:2.6, floor:362, fw:92,
    desc:'Slim hard case with your print across the whole back.', fabric:'Polycarbonate, gloss finish',
    body:'M138 46 H262 A32 32 0 0 1 294 78 V322 A32 32 0 0 1 262 354 H138 A32 32 0 0 1 106 322 V78 A32 32 0 0 1 138 46 Z',
    details:[{d:'M140 66 H198 A12 12 0 0 1 210 78 V128 A12 12 0 0 1 198 140 H140 A12 12 0 0 1 128 128 V78 A12 12 0 0 1 140 66 Z',k:'shade'},{d:'M154 90 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 M154 118 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0',k:'line'}],
    area:[124,160,152,170]},
  tote:  {name:'Tote bag', noun:'a tote', group:'accessories', price:75, inches:12, floor:370, fw:132,
    desc:'Heavy canvas tote with long handles that go over the shoulder.', fabric:'12 oz cotton canvas',
    body:'M86 148 L314 148 L324 362 L76 362 Z',
    details:[{d:'M138 150 Q138 56 200 56 Q262 56 262 150',k:'strap'},{d:'M86 148 L314 148 L313 166 L87 166 Z',k:'shade'}],
    area:[116,188,168,146]}
};
JT.colours = [
  {id:'white', name:'White', hex:'#F7F5EF'},
  {id:'black', name:'Black', hex:'#1D1C1A'},
  {id:'red',   name:'Spot red', hex:'#C2301A'},
  {id:'yellow',name:'Yellow', hex:'#F2C230'},
  {id:'navy',  name:'Navy', hex:'#24324D'},
  {id:'green', name:'Bottle green', hex:'#2E5E3E'},
  {id:'sand',  name:'Sand', hex:'#CDBB94'}
];
/* colour helpers */
JT.rgb = function(hex){var c=hex.replace('#','');return [parseInt(c.substr(0,2),16),parseInt(c.substr(2,2),16),parseInt(c.substr(4,2),16)]};
JT.mix = function(a,b,t){var x=JT.rgb(a),y=JT.rgb(b);return '#'+x.map(function(v,i){return ('0'+Math.round(v+(y[i]-v)*t).toString(16)).slice(-2)}).join('')};
JT.lum = function(hex){var c=JT.rgb(hex);return (c[0]*.2126+c[1]*.7152+c[2]*.0722)/255};
JT.inkFor = function(hex){ // readable ink colour on a blank
  var c=JT.rgb(hex);
  return (c[0]*299+c[1]*587+c[2]*114)/1000 > 140 ? '#141311' : '#F7F5EF';
};
/* sample ready-made rail */
JT.products = [
  {id:'plain-tee', blank:'tee', colour:'white', name:'Plain tee, blank', mark:null},
  {id:'name-tee', blank:'tee', colour:'black', name:'Name tee', mark:{t:'AKOSUA',c:'#F2C230'}, extra:25},
  {id:'team-hoodie', blank:'hoodie', colour:'navy', name:'Team hoodie', mark:{t:'TEAM 26',c:'#F7F5EF'}, extra:25},
  {id:'snapback', blank:'cap', colour:'red', name:'Front-print cap', mark:{t:'ACCRA',c:'#F7F5EF'}, extra:25},
  {id:'birthday-mug', blank:'mug', colour:'white', name:'Birthday mug', mark:{t:'HBD!',c:'#C2301A'}, extra:25},
  {id:'quote-case', blank:'case', colour:'yellow', name:'Name phone case', mark:{t:'ESI',c:'#141311'}, extra:25},
  {id:'event-tote', blank:'tote', colour:'sand', name:'Event tote', mark:{t:'SAVE THE DATE',c:'#141311'}, extra:25},
  {id:'church-tee', blank:'tee', colour:'red', name:'Group event tee', mark:{t:'CHOIR',c:'#F7F5EF'}, extra:25},
  {id:'plain-hoodie', blank:'hoodie', colour:'black', name:'Plain hoodie, blank', mark:null},
  {id:'plain-mug', blank:'mug', colour:'black', name:'Plain mug, blank', mark:null},
  {id:'logo-cap', blank:'cap', colour:'black', name:'Logo cap', mark:{t:'LOGO',c:'#F2C230'}, extra:25},
  {id:'plain-tote', blank:'tote', colour:'white', name:'Plain tote, blank', mark:null}
];
JT.inks = [
  {name:'DTF transfer', c:'#C2301A', best:'Full colour, photos, small runs', feel:'Smooth, slight sheen', from:'1 piece'},
  {name:'Screen print', c:'#141311', best:'Bold flat colours, big runs', feel:'Soft, sits in the fabric', from:'25 pieces'},
  {name:'Vinyl', c:'#F2C230', best:'Names and numbers', feel:'Crisp, slightly raised', from:'1 piece'},
  {name:'Sublimation', c:'#24324D', best:'Mugs, cases, polyester', feel:'None, the ink dyes in', from:'1 piece'},
  {name:'Embroidery', c:'#2E5E3E', best:'Caps and small logos', feel:'Stitched, textured', from:'10 pieces'}
];
JT.arts = [
  {id:'star', name:'Star', d:'M50 4 L62 38 L98 38 L69 60 L80 95 L50 74 L20 95 L31 60 L2 38 L38 38 Z'},
  {id:'heart', name:'Heart', d:'M50 90 L12 52 A22 22 0 0 1 50 18 A22 22 0 0 1 88 52 Z'},
  {id:'crown', name:'Crown', d:'M8 78 L14 26 L34 50 L50 18 L66 50 L86 26 L92 78 Z M8 84 H92 V94 H8 Z'},
  {id:'bolt', name:'Bolt', d:'M58 2 L18 56 H46 L38 98 L82 40 H54 Z'},
  {id:'sun', name:'Sun', d:'M50 26 A24 24 0 1 1 49.9 26 Z M47 0 H53 V16 H47 Z M47 84 H53 V100 H47 Z M0 47 H16 V53 H0 Z M84 47 H100 V53 H84 Z M14 18 L18 14 L30 26 L26 30 Z M70 74 L74 70 L86 82 L82 86 Z M82 14 L86 18 L74 30 L70 26 Z M26 70 L30 74 L18 86 L14 82 Z'}
];
JT.fonts = [
  {id:'cond', name:'Label Condensed', css:'900 {s}px Archivo', stretch:'extra-condensed'},
  {id:'wide', name:'Wide Block', css:'800 {s}px Archivo', stretch:'expanded'},
  {id:'mono', name:'Ticket Mono', css:'500 {s}px "Plex Mono"', stretch:'normal'},
  {id:'serif', name:'Classic Serif', css:'700 {s}px Georgia, "Times New Roman", serif', stretch:'normal'},
  {id:'script', name:'Hand Script', css:'italic 700 {s}px "Brush Script MT", "Segoe Script", cursive', stretch:'normal'}
];
/* home page copy: names the hero types onto the tee, and the ticker */
JT.heroNames = ['AKOSUA','KOFI & AMA','CHOIR ’26','HBD ESI','CLASS OF 26','YAW @ 30','NANA B'];
JT.heroCols  = ['white','black','red','navy','sand','green','yellow'];
JT.tickerNames = ['Akosua','Choir ’26','Kofi & Ama','HBD Esi','Class of 2026','Yaw @ 30','Owusu reunion','Save the date','Team Nana','Ewurabena','Adjoa’s 21st','Your name here'];
/* sample past jobs for the "off the press" wall */
JT.jobs = [
  {jt:'NN-0391', blank:'tee', colour:'red', mark:{t:'CHOIR ’26',c:'#F7F5EF'}, qty:40, what:'Choir tees', place:'Kumasi'},
  {jt:'NN-0402', blank:'mug', colour:'white', mark:{t:'HBD ESI',c:'#C2301A'}, qty:12, what:'Birthday mugs', place:'Tema'},
  {jt:'NN-0415', blank:'hoodie', colour:'navy', mark:{t:'CLASS OF 26',c:'#F2C230'}, qty:85, what:'Leavers’ hoodies', place:'Cape Coast'},
  {jt:'NN-0418', blank:'cap', colour:'black', mark:{t:'OSU FC',c:'#F2C230'}, qty:22, what:'Team caps', place:'Osu, Accra'},
  {jt:'NN-0423', blank:'tote', colour:'sand', mark:{t:'SAVE THE DATE',c:'#141311'}, qty:150, what:'Wedding totes', place:'London'},
  {jt:'NN-0427', blank:'case', colour:'yellow', mark:{t:'ADJOA',c:'#141311'}, qty:1, what:'Phone case', place:'East Legon'},
  {jt:'NN-0431', blank:'tee', colour:'green', mark:{t:'OWUSU REUNION',c:'#F7F5EF'}, qty:64, what:'Family reunion tees', place:'Houston'},
  {jt:'NN-0436', blank:'hoodie', colour:'black', mark:{t:'KOFI & AMA',c:'#F7F5EF'}, qty:2, what:'Matching hoodies', place:'Accra'}
];
/* FAQ: <i class="ph"> marks a placeholder value, <span class="tbc"> a client note */
JT.faq = [
  ['Do I see it before you print?', 'Yes. We send a proof on WhatsApp with your job number. Nothing goes to press until you reply OK.'],
  ['How long does it take?', 'Most jobs are ready <i class="ph">3 to 5 working days</i> after you approve the proof. Rush jobs are possible. <span class="tbc">Turnaround TBC</span>'],
  ['How do I pay?', 'Mobile Money (MTN, Telecel, AirtelTigo) or card, through Paystack. Bulk orders can pay a deposit first. <span class="tbc">Deposit terms TBC</span>'],
  ['Do you deliver outside Accra?', 'Riders cover Accra. Other regions go <i class="ph">by courier</i>, and we ship to the diaspora. <span class="tbc">Areas and fees TBC</span>'],
  ['What should I upload?', 'A PNG with a transparent background, ideally 2000 pixels wide or more. The Studio tells you if an image is too small to print sharply.'],
  ['Can I return a custom item?', 'Items printed with your design can’t be returned unless we got it wrong. Plain blanks follow the normal returns policy. <span class="tbc">Policy TBC</span>']
];
JT.priceOf = function(p){ return JT.blanks[p.blank].price + (p.extra||0); };
