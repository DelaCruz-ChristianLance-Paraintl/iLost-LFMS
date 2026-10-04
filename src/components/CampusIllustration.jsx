import { memo } from 'react'

// src/components/CampusIllustration.jsx
// Isometric lost-and-found campus scene (static SVG markup, no external assets).

function buildScene(withBg = false) {
const u=14,ox=320,oy=100;
const X=(x,y)=>ox+(x-y)*u, Y=(x,y,z)=>oy+(x+y)*u/2-z;
const P=(x,y,z)=>X(x,y).toFixed(1)+','+Y(x,y,z).toFixed(1);
const poly=(pts,fill,ex='')=>`<polygon points="${pts.map(p=>P(...p)).join(' ')}" fill="${fill}" ${ex}/>`;
const box=(x,y,z,w,d,h,c)=>[
 poly([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],c[0]),
 poly([[x,y+d,z+h],[x+w,y+d,z+h],[x+w,y+d,z],[x,y+d,z]],c[1]),
 poly([[x+w,y,z+h],[x+w,y+d,z+h],[x+w,y+d,z],[x+w,y,z]],c[2])].join('');
const stone=['#EDE8EB','#BDB3B9','#9C9299'];
const line=(a,b,st,w,ex='')=>`<line x1="${X(a[0],a[1]).toFixed(1)}" y1="${Y(a[0],a[1],a[2]).toFixed(1)}" x2="${X(b[0],b[1]).toFixed(1)}" y2="${Y(b[0],b[1],b[2]).toFixed(1)}" stroke="${st}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
const at=(x,y,z)=>[X(x,y),Y(x,y,z)];
const flat=(x,y,z,w,h,body,scr)=>{const[a,b]=at(x,y,z);return `<g transform="matrix(${u},${u/2},${-u},${u/2},${a.toFixed(1)},${b.toFixed(1)})"><rect width="${w}" height="${h}" rx=".08" fill="${body}"/><rect x=".07" y=".07" width="${w-.14}" height="${h-.14}" rx=".05" fill="${scr}"/></g>`;};
const backpack=(x,y,z,c,d)=>{const[a,b]=at(x,y,z);return `<g transform="translate(${a.toFixed(1)},${b.toFixed(1)})"><ellipse rx="12" ry="4" fill="#000" opacity=".2"/><rect x="-9" y="-25" width="18" height="25" rx="7" fill="${c}"/><rect x="-6" y="-13" width="12" height="9" rx="3" fill="${d}"/><path d="M-4-25q4-8 8 0" fill="none" stroke="${d}" stroke-width="2.4"/><rect x="-9" y="-18" width="18" height="2" fill="${d}" opacity=".6"/></g>`;};
const key=(x,y,z)=>{const[a,b]=at(x,y,z);return `<g transform="translate(${a.toFixed(1)},${b.toFixed(1)})"><ellipse rx="9" ry="3" fill="#000" opacity=".2"/><circle cy="-11" r="5.5" fill="none" stroke="#F2C14E" stroke-width="2.4"/><path d="M0-5.5V3M0 0h4M0 3h3" fill="none" stroke="#F2C14E" stroke-width="2.4" stroke-linecap="round"/></g>`;};
const headphones=(x,y,z)=>{const[a,b]=at(x,y,z);return `<g transform="translate(${a.toFixed(1)},${b.toFixed(1)})"><ellipse rx="11" ry="3.5" fill="#000" opacity=".2"/><path d="M-9-2v-6a9 9 0 0 1 18 0v6" fill="none" stroke="#2B2733" stroke-width="2.6"/><rect x="-11" y="-8" width="5" height="9" rx="2.5" fill="#D1006F"/><rect x="6" y="-8" width="5" height="9" rx="2.5" fill="#D1006F"/></g>`;};
const person=(x,y,z,o)=>{const[a,b]=at(x,y,z);const f=o.flip?-1:1,s=o.s||1.1;
 return `<g transform="translate(${a.toFixed(1)},${b.toFixed(1)}) scale(${f*s},${s})"><ellipse rx="13" ry="4" fill="#000" opacity=".22"/>
 ${o.bag?`<rect x="-14" y="-47" width="9" height="24" rx="4" fill="#2B2733"/>`:''}
 <rect x="-6.5" y="-23" width="5.5" height="21" fill="${o.pants||'#2B2733'}"/><rect x="1" y="-23" width="5.5" height="21" fill="${o.pants||'#2B2733'}"/>
 <rect x="-8" y="-3" width="7.5" height="3.5" rx="1.5" fill="#F4F0F2"/><rect x="0.5" y="-3" width="7.5" height="3.5" rx="1.5" fill="#F4F0F2"/>
 ${o.ponytail?`<circle cx="-9" cy="-53" r="4" fill="${o.hair}"/>`:''}
 <rect x="-9.5" y="-48" width="19" height="27" rx="6" fill="${o.shirt}"/>
 <line x1="-8" y1="-43" x2="-10" y2="-30" stroke="${o.shirt}" stroke-width="5.5" stroke-linecap="round"/><circle cx="-10" cy="-27" r="2.6" fill="${o.skin}"/>
 <line x1="8" y1="-43" x2="14" y2="-36" stroke="${o.shirt}" stroke-width="5.5" stroke-linecap="round"/>
 <line x1="14" y1="-36" x2="12" y2="-47" stroke="${o.skin}" stroke-width="4" stroke-linecap="round"/>
 <rect x="8.5" y="-58" width="7" height="11" rx="1.6" fill="#1B1B22"/><rect x="9.6" y="-56.8" width="4.8" height="8.4" rx="1" fill="#8FD6FF"/>
 <circle cy="-56" r="8.5" fill="${o.skin}"/><path d="M-8.8-57a8.8 8.8 0 0 1 17.6 0c-5-4-12.6-4-17.6 0z" fill="${o.hair}"/></g>`;};
const chip=(x,y,label,icon)=>`<g transform="translate(${x},${y})"><rect width="${label.length*6.1+42}" height="30" rx="4" fill="#fff"/><rect x="8" y="7" width="16" height="16" rx="3" fill="#D1006F"/><text x="16" y="19" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#fff">${icon}</text><text x="32" y="19.5" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#2B252A">${label}</text></g>`;
const pin=(x,y,z)=>{const[a,b]=at(x,y,z);return `<g transform="translate(${a.toFixed(1)},${b.toFixed(1)})"><ellipse rx="9" ry="3.5" fill="none" stroke="#FF4F94" stroke-width="1.4" opacity=".7"/><path d="M0 0C-8-10-9-14-9-17a9 9 0 1 1 18 0c0 3-1 7-9 17z" fill="#E6127A"/><circle cy="-17" r="3.4" fill="#fff"/></g>`;};
const node=(x,y,z)=>{const[a,b]=at(x,y,z);return `<ellipse cx="${a.toFixed(1)}" cy="${b.toFixed(1)}" rx="6" ry="3" fill="#FF3D7F"/><ellipse cx="${a.toFixed(1)}" cy="${b.toFixed(1)}" rx="10" ry="5" fill="none" stroke="#FF3D7F" stroke-width="1" opacity=".5"/>`;};
const route=(pts)=>{const d='M'+pts.map(p=>P(p[0],p[1],16)).join('L');return `<path d="${d}" fill="none" stroke="#FF3D7F" stroke-width="7" opacity=".22" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#FF3D7F" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`+node(pts[0][0],pts[0][1],16)+node(pts[pts.length-1][0],pts[pts.length-1][1],16);};
let s=`<svg viewBox="0 0 640 420" width="100%" xmlns="http://www.w3.org/2000/svg" role="img"><title>Campus lost and found illustration</title><desc>Isometric campus plaza where students report and recover lost items</desc>`;
if(withBg){s+=`<defs><linearGradient id="bgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14030C"/><stop offset=".5" stop-color="#3D0622"/><stop offset="1" stop-color="#76003F"/></linearGradient></defs><rect width="640" height="420" fill="url(#bgg)"/>`;for(let i=1;i<8;i++)s+=`<line x1="${i*80}" y1="0" x2="${i*80}" y2="420" stroke="#D1006F" stroke-opacity=".12"/>`;for(let i=1;i<6;i++)s+=`<line x1="0" y1="${i*70}" x2="640" y2="${i*70}" stroke="#D1006F" stroke-opacity=".12"/>`;}
s+=`<ellipse cx="320" cy="300" rx="290" ry="118" fill="#D1006F" opacity=".14"/>`;
s+=box(0,0,0,20,20,16,stone);
s+=poly([[0,0,16],[20,0,16],[20,20,16],[0,20,16]],'none','stroke="#FF6FA8" stroke-opacity=".5" stroke-width="1.2"');
s+=route([[2,9],[2,18.5],[11,18.5]])+route([[19,7],[19,18.5],[11,18.5]]);
{ // map on ground
const mp=[[6,22],[14,22],[14,27],[6,27]];
s+=poly(mp.map(p=>[p[0],p[1],0]),'#F3E6EE','stroke="#FF6FA8" stroke-width="1.5"');
s+=line([7,23.5,0],[13,23.5,0],'#E8B7D0',3)+line([7,25.5,0],[13,25.5,0],'#E8B7D0',3)+line([8.5,22,0],[8.5,27,0],'#E8B7D0',3)+line([11.5,22,0],[11.5,27,0],'#E8B7D0',3)+line([6.5,22.5,0],[13.5,26.5,0],'#D1006F',2);
s+=pin(9.5,24.5,0);}
s+=pin(-2,9,0)+pin(22,4.5,0);
// screen
const y0=3,zb=16,zt=104;
const q=(x0,x1,z0,z1,f,ex='')=>poly([[x0,y0,z1],[x1,y0,z1],[x1,y0,z0],[x0,y0,z0]],f,ex);
s+=q(1,11,zb,zt,'#F7F1F5','fill-opacity=".9" stroke="#fff" stroke-width="1.5"');
s+=q(1,11,zt-14,zt,'#D1006F');
for(let i=0;i<5;i++){const z=zt-28-i*13;s+=line([1.6,y0,z],[10.4,y0,z],'#D8C6D0',1.2)+line([1.8,y0,z+5],[4.2,y0,z+5],'#B9A3B0',3)+line([5,y0,z+5],[7.2,y0,z+5],'#D8C6D0',3)+line([8,y0,z+5],[9.8,y0,z+5],'#D1006F',3);}
s+=line([1,y0,zb],[11,y0,zb],'#9C9299',3);
s+=person(0.6,6.2,16,{shirt:'#D1006F',skin:'#E0A98A',hair:'#1F1A1D',bag:true,ponytail:true,s:1.15});
s+=person(3.6,5.6,16,{shirt:'#E11D5A',skin:'#C68B63',hair:'#2A1B18',ponytail:true,flip:false,s:1.15});
s+=person(11.4,2.4,16,{shirt:'#C2185B',skin:'#E0A98A',hair:'#1F1A1D',flip:true,s:1.15});
// back-right tier
s+=box(13.2,1,16,7,5,9,stone)+box(14.2,2,25,5,3,7,['#F4F0F2','#C9C0C5','#A69CA3']);
s+=flat(19.4,3,25,.5,1,'#1B1B22','#8FD6FF')+backpack(15.3,3.6,32,'#D1006F','#98004F')+flat(17,3.2,32,.5,1,'#1B1B22','#8FD6FF')+key(18.2,4.3,32);
// steps, planter
s+=box(5,6,16,11,11,4,stone)+box(7,8,20,7,7,4,['#F4F0F2','#C9C0C5','#A69CA3']);
s+=backpack(5.9,13,20,'#3A3742','#24222B')+flat(14.6,10.4,20,.5,1,'#1B1B22','#8FD6FF')+key(10.5,16.2,20)+headphones(13.2,16.3,20);
s+=box(8.5,9.5,24,4,4,6,['#7FA055','#B3A9AF','#948A91']);
{const[a,b]=at(10.5,11.5,30);
s+=`<rect x="${a-4}" y="${b-42}" width="8" height="42" fill="#7B5A43"/><circle cx="${a}" cy="${b-62}" r="36" fill="#4F7A3A"/><circle cx="${a-24}" cy="${b-44}" r="24" fill="#5E8C45"/><circle cx="${a+26}" cy="${b-46}" r="25" fill="#6FA050"/><circle cx="${a+4}" cy="${b-74}" r="20" fill="#7DB05A"/>`;}
// kiosk
s+=box(15.6,15.2,16,1.8,1.4,22,['#8E858B','#6B6369','#575055']);
s+=box(14.8,15.6,38,3.4,0.6,30,['#2A2D35','#14171D','#0C0E12']);
{const ky=16.2;for(let i=0;i<4;i++){const z=62-i*6;s+=line([15.4,ky,z],[16.8+(i%2)*1.2,ky,z],'#FF3D7F',2);}
s+=line([15.4,ky,44],[17.4,ky,44],'#D1006F',5);}
s+=person(19.2,15.4,16,{shirt:'#B3123F',skin:'#C68B63',hair:'#1F1A1D',flip:true,s:1.15});
s+=chip(96,60,'Found Item','+')+chip(468,64,'Lost Item','i');
return s+'</svg>';}

const markup = buildScene(false)

function CampusIllustration() {
  return (
    <div
      className="campus-illustration-image"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

export default memo(CampusIllustration)