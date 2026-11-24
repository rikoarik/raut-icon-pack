// Geometry used for RAUT's FigCraft revision, on the same 24 × 24 grid.
import { specimenPaths } from './specimen-paths.js'

const weight = { broken:1.8, 'potong-serong':1.75, tipis:1.5 }
const p = (v) => v.map(n => +n.toFixed(3)).join(' ')
const line = (a,b) => [a,b]
const end = s => s.at(-1)
const dist = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1])
const lerp = (a,b,t) => [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]
const curve = (s,t) => s.length===2 ? lerp(s[0],s[1],t) : lerp(lerp(lerp(s[0],s[1],t),lerp(s[1],s[2],t),t),lerp(lerp(s[1],s[2],t),lerp(s[2],s[3],t),t),t)
function parse(path,x,y) {
  let cursor, item
  const items=[]
  for(const [,cmd,args] of path.matchAll(/([MLCZ])([^MLCZ]*)/g)) {
    const n=(args.match(/[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi)??[]).map(Number)
    const pts=Array.from({length:n.length/2},(_,i)=>[n[i*2]+x,n[i*2+1]+y])
    if(cmd==='M'){cursor=pts[0];item={start:cursor,segs:[],closed:false};items.push(item)}
    else if(cmd==='Z'){if(dist(cursor,item.start)>.001)item.segs.push(line(cursor,item.start));item.closed=true}
    else {item.segs.push([cursor,...pts]);cursor=pts.at(-1)}
  }
  return items
}
const encode=({segs,closed})=>segs.length?'M'+p(segs[0][0])+segs.map(s=>(s.length===2?'L':'C')+s.slice(1).map(p).join(' ')).join('')+(closed?'Z':''):''
const circle = (x,y,r) => `M${x+r} ${y}a${r} ${r} 0 1 0 ${-2*r} 0a${r} ${r} 0 1 0 ${2*r} 0Z`
const rr = (x,y,w,h,r) => `M${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${y+h-r}Q${x+w} ${y+h} ${x+w-r} ${y+h}H${x+r}Q${x} ${y+h} ${x} ${y+h-r}V${y+r}Q${x} ${y} ${x+r} ${y}Z`
const tile=(x,y,w,h)=>`M${x} ${y}H${x+w}V${y+h}H${x}Z`
const facetBox=(x,y,w,h,c)=>`M${x+c} ${y}H${x+w-c}L${x+w} ${y+c}V${y+h-c}L${x+w-c} ${y+h}H${x+c}L${x} ${y+h-c}V${y+c}Z`
const oct=(x,y,r)=>facetBox(x-r,y-r,r*2,r*2,r*.53)
const layer = (path, weight, extra = {}) => ({ path, x: 0, y: 0, weight, ...extra })
const thumb=(at)=>circle(at,12,2.2)
const cornerFocus='M4 9V5Q4 4 5 4H9M15 4H19Q20 4 20 5V9M20 15V19Q20 20 19 20H15M9 20H5Q4 20 4 19V15'
const diagonal='M5.5 18.5 18.5 5.5M9 5.5H18.5V15'
const panel=(x)=>`M${x} 5.5V18.5`+rr(3.5,5.5,17,13,2)
const checks='M3.7 6.3 5.2 7.8 7.4 5.4M3.7 12 5.2 13.5 7.4 11.1M3.7 17.7 5.2 19.2 7.4 16.8'
const bars='M11 6.5H20M11 12H20M11 17.5H20'
const keys='M7 10h.01M12 10h.01M17 10h.01M8 14.5H16'
const contrastArc='M12 4.5A7.5 7.5 0 1 0 12 19.5Z'
const xMark='M9 9l6 6m0-6-6 6'
const plus='M10 7v6m-3-3h6'
const cc='M10.5 9.5h-1.8Q7 9.5 7 11v2q0 1.5 1.7 1.5h1.8m6.5-5h-1.8Q13.5 9.5 13.5 11v2q0 1.5 1.7 1.5H17'
const arrowSolid='M8 4.5h10.3q1.2 0 1.2 1.2V16h-2.7V9.1L6.1 19.8l-1.9-1.9L14.9 7.2H8Z'
const reflected=(path)=>path.replace(/([MLHVQZ])([^MLHVQZ]*)/gi,(_,c,args)=>{const nums=(args.match(/[-+]?(?:\d*\.\d+|\d+\.?\d*)/g)??[]).map(Number);return c+nums.map(v=>+(c===c.toUpperCase()?24-v:-v).toFixed(4)).join(' ')})
const cutRing='M16.6 5.9A7.6 7.6 0 1 0 19.5 11'
const bayangBox=(edge,bg)=>[layer(bg,0,{opacity:.22}),layer(edge,1.7)]
const solids={
  'arrow-up-right':arrowSolid,'arrow-down-left':reflected(arrowSolid),
  'panel-left':rr(3,5,18,14,2)+tile(10,7.4,8.6,9.2),'panel-right':rr(3,5,18,14,2)+tile(5.4,7.4,8.6,9.2),
  checkbox:rr(4,4,16,16,2.6)+'M7.3 12.3l1.5-1.5 2.2 2.2 4.7-5 1.6 1.5-6.3 6.7Z',
  home:'M3.5 10.3 12 3.5 20.5 10.3V19Q20.5 20.5 19 20.5H15V13.5H9V20.5H5Q3.5 20.5 3.5 19Z',
  camera:'M3 8.5Q3 6.5 5 6.5H8L9.7 4.5H14.3L16 6.5H19Q21 6.5 21 8.5V17Q21 19 19 19H5Q3 19 3 17Z'+circle(12,12.5,3.3),
  user:circle(12,7.5,3.8)+'M4.5 20A7.5 7.5 0 0 1 19.5 20Z',
  contrast:contrastArc,
  'check-circle':circle(12,12,8.6)+'M7 12.1l1.45-1.45 2.25 2.25 4.65-4.7 1.5 1.5-6.15 6.2Z',
  'alert-circle':circle(12,12,8.6)+'M11 7.6h2v5.4h-2Z'+circle(12,15.45,1.05),
  'alert-triangle':'M10.55 4.9q1.45-2.35 2.9 0l8.15 13.6q.85 1.5-.85 1.5H3.25q-1.7 0-.85-1.5Z'+'M11 9h2v5.5h-2Z'+circle(12,17,1),
  heart:'M12 20.8 4.8 14Q2.5 12 2.5 9.2A4.7 4.7 0 0 1 12 8.5a4.7 4.7 0 0 1 9.5.7Q21.5 12 19.2 14Z',
  play:'M7 5.2q0-1.2 1.1-.55l12 6.6q1.4.75 0 1.5l-12 6.6q-1.1.65-1.1-.55Z',
  pause:rr(6,4.5,4.3,15,1)+rr(13.7,4.5,4.3,15,1),
  stop:rr(5,5,14,14,2.2),
  'map-pin':'M12 21Q4.7 15 4.7 10.5a7.3 7.3 0 1 1 14.6 0Q19.3 15 12 21Z'+circle(12,10.3,2.75),
}
const boldMixed={
  'toggle-on': [layer(rr(3,7,18,10,5)+circle(16,12,2.55),0,{evenOdd:true})],
  'toggle-off':[layer(rr(3.5,7.5,17,9,4.5),2.35),layer(thumb(8),0)],
  radio:[layer(circle(12,12,7.8),2.35),layer(circle(12,12,3.1),0)],
  contrast:[layer(contrastArc,0),layer(circle(12,12,7.5),2.1)],
  keyboard:[layer(rr(3.8,6.4,16.4,11.2,2),2.25),layer(keys,1.85)],
  captions:[layer(rr(3.7,5.7,16.6,12.6,2),2.25),layer(cc,1.65)],
  layers:[layer('M3.2 8 12 3.5 20.8 8 12 12.5Z',0),layer('M4.1 12l7.9 4.1 7.9-4.1M4.1 16l7.9 4.1 7.9-4.1',2.2)],
  'event-workshop':[layer(rr(3.6,5.3,16.8,12.1,1.4)+'M8 20h8m-4-2.6V20',2.25),layer('M7 11.4l2-2 2 2-2 2Zm6.3 0h3.6m-1.8-1.8V13.2',1.45)],
  'info-circle':[layer(circle(12,12,8.25)+'M11 10.7h2v5h-2Z'+circle(12,8.6,1),0,{evenOdd:true})],
  'x-circle':[layer(circle(12,12,8.25)+'M8.2 9.6l1.4-1.4 2.4 2.4 2.4-2.4 1.4 1.4-2.4 2.4 2.4 2.4-1.4 1.4-2.4-2.4-2.4 2.4-1.4-1.4 2.4-2.4Z',0,{evenOdd:true})],
}
const overrides={
  broken:{
    'arrow-up-right':'M5.5 18.5 11.5 12.5M14.5 9.5 18.5 5.5M9.5 5.5H18.5V14.5',
    'arrow-down-left':'M18.5 5.5 12.5 11.5M9.5 14.5 5.5 18.5M14.5 18.5H5.5V9.5',
    'panel-left':'M8 5.5H5.5Q3.5 5.5 3.5 7.5V16.5Q3.5 18.5 5.5 18.5H9.5V10M12 5.5H18.5Q20.5 5.5 20.5 7.5V16.5Q20.5 18.5 18.5 18.5H13.5',
    'panel-right':'M16 5.5H18.5Q20.5 5.5 20.5 7.5V16.5Q20.5 18.5 18.5 18.5H14.5V10M12 5.5H5.5Q3.5 5.5 3.5 7.5V16.5Q3.5 18.5 5.5 18.5H10.5',
    list:'M4.5 6.5h.01m0 5.5h.01m0 5.5h.01M9 6.5H20M9 12H14M17.7 12H20M9 17.5H20',
    'list-checks':checks+'M11 6.5H20M11 12H14.5M18 12H20M11 17.5H20',
    'toggle-on':'M8 7.5H6.8A4.5 4.5 0 0 0 6.8 16.5H10.3M12.3 7.5H17.2A4.5 4.5 0 0 1 17.2 16.5H14.5M16.5 12h.01',
    'toggle-off':'M16 7.5H17.2A4.5 4.5 0 0 1 17.2 16.5H13.7M11.7 7.5H6.8A4.5 4.5 0 0 0 6.8 16.5H9.5M7.5 12h.01',
    checkbox:'M19.5 11.5V17.5Q19.5 19.5 17.5 19.5H6.5Q4.5 19.5 4.5 17.5V6.5Q4.5 4.5 6.5 4.5H14.5M8 12l3 3 7-7',
    radio:cutRing+circle(12,12,2.55), 'info-circle':cutRing+'M12 11.3V16M12 8.5h.01',
    'help-circle':cutRing+'M9.8 10a2.3 2.3 0 1 1 3.5 2q-1.3.6-1.3 1.6M12 16.2h.01',
    'x-circle':cutRing+xMark,
    link:'M9.2 7.2 11.8 4.6a4.3 4.3 0 0 1 6.1 6.1l-2.6 2.6m-.7 3.5L12.2 19.4a4.3 4.3 0 0 1-6.1-6.1l2.6-2.6m1.1 3.5 4.4-4.4',
    keyboard:'M20 11.5V15.7Q20 17.7 18 17.7H6Q4 17.7 4 15.7V8.3Q4 6.3 6 6.3H14M17.5 6.3H18Q20 6.3 20 8.3'+keys,
    focus:cornerFocus+'M14 10a2.85 2.85 0 1 0 .7 3',
    'event-workshop':'M4 11V6H15M18.5 6H20V17H4V14.5M12 17V20M8 20H16M7 11.5l2 2 2-2-2-2Zm6.5 0h3.5m-1.75-1.75v3.5',
    'align-left':'M4 5h16M4 10h3.8m3.7 0H14M4 15h16M4 20h10',
    'align-right':'M4 5h16M10 10h2.5m3.7 0H20M4 15h16M10 20h10',
    'align-center':'M4 5h16M7 10h2.8m4.4 0H17M4 15h16M7 20h10',
    'align-justify':'M4 5h16M4 10h5.8m4.4 0H20M4 15h16M4 20h16',
    'columns':'M4 5h12M19.8 5V19H4V8.8M9.2 5v14m5.6-14v14',
    'rows':'M4 5h12M19.8 5V19H4V8.8M4 9.7h15.8m-15.8 4.6h15.8',
    ...specimenPaths.broken,
  },
  'potong-serong':{
    'arrow-up-right':'M5.5 18.5 17.2 6.8M8.5 5.5H16L18.5 8V15.5',
    'arrow-down-left':'M18.5 5.5 6.8 17.2M15.5 18.5H8L5.5 16V8.5',
    'panel-left':facetBox(3.5,5.5,17,13,2.65)+'M9.5 5.5v13',
    'panel-right':facetBox(3.5,5.5,17,13,2.65)+'M14.5 5.5v13',
    list:'M4.5 6.9l1.2-1.2m-1.2 6.9 1.2-1.2m-1.2 6.9 1.2-1.2M9 6.4h10m-10 5.6h10m-10 5.6h10',
    'list-checks':checks+bars,
    checkbox:facetBox(4.4,4.4,15.2,15.2,3)+'M8 12l3 3 5.5-6',
    'toggle-on':facetBox(3.5,7.5,17,9,3.25)+'M15 10.5l2 1.5-2 1.5L13 12Z',
    'toggle-off':facetBox(3.5,7.5,17,9,3.25)+'M9 10.5l2 1.5-2 1.5L7 12Z',
    radio:oct(12,12,7.6)+'M12 9.5l2.5 2.5-2.5 2.5-2.5-2.5Z',
    'info-circle':oct(12,12,7.6)+'M12 11.2v4.4M12 8.4h.01',
    'help-circle':oct(12,12,7.6)+'M9.8 10A2.3 2.3 0 1 1 13 12l-1 1.1v.6M12 16h.01',
    'x-circle':oct(12,12,7.6)+xMark,
    ban:oct(12,12,7.6)+'M6.3 6.3l11.4 11.4',
    search:oct(10.3,10.3,5.9)+'M14.8 14.8 20 20',
    'zoom-in':oct(10,10,5.8)+plus+'M14.3 14.3 20 20',
    'zoom-out':oct(10,10,5.8)+'M7 10h6M14.3 14.3 20 20',
    keyboard:facetBox(3.5,6.3,17,11.4,2.5)+keys,
    captions:facetBox(3.5,5.5,17,13,2.3)+cc,
    focus:'M4 9V6L6 4H9M15 4H18L20 6V9M20 15V18L18 20H15M9 20H6L4 18V15M12 9l3 3-3 3-3-3Z',
    layers:'M3.5 7.8 10.8 4h2.4l7.3 3.8-7.3 3.8h-2.4ZM3.5 12.4l7.3 3.8h2.4l7.3-3.8M3.5 17l7.3 3.8h2.4l7.3-3.8',
    'event-workshop':facetBox(3.8,5.2,16.4,12.3,2.1)+'M8 20h8m-4-2.5V20M8 9.5l2 2-2 2-2-2Zm4.4 2h4.3m-2.15-2.15v4.3',
    ...specimenPaths['potong-serong'],
  },
  tipis:{
    'arrow-up-right':diagonal,'arrow-down-left':'M18.5 5.5 5.5 18.5M15 18.5H5.5V9',
    'panel-left':panel(9.5),'panel-right':panel(14.5), list:bars+'M5 6.5h.01M5 12h.01M5 17.5h.01','list-checks':checks+bars,
    'toggle-on':rr(3.5,7.5,17,9,4.5)+circle(16,12,1.7),'toggle-off':rr(3.5,7.5,17,9,4.5)+circle(8,12,1.7),
    keyboard:rr(3.5,6,17,12,2.2)+keys,
    contrast:circle(12,12,7.5)+'M12 4.6v14.8M9.1 8.3v7.4',
    focus:cornerFocus+circle(12,12,2.55), 'event-workshop':rr(3.6,5.3,16.8,12.1,1.4)+'M8 20h8m-4-2.6V20M7 11.4l2-2 2 2-2 2Zm6.3 0h3.6m-1.8-1.8V13.2',
  },
}
const shadows={
 'panel-left':bayangBox(panel(9.5),'M5.5 5.5h4v13h-4q-2 0-2-2v-9q0-2 2-2Z'),
 'panel-right':bayangBox(panel(14.5),'M18.5 5.5h-4v13h4q2 0 2-2v-9q0-2-2-2Z'),
 'toggle-on':bayangBox(rr(3.5,7.5,17,9,4.5)+circle(16,12,1.8),rr(3.5,7.5,17,9,4.5)),
 'toggle-off':bayangBox(rr(3.5,7.5,17,9,4.5),thumb(8)).map((g,i)=>i===0?{...g,opacity:.36}:g),
 checkbox:bayangBox(rr(4.2,4.2,15.6,15.6,2.3)+'M8 12l3 3 5.3-6',rr(4.2,4.2,15.6,15.6,2.3)),
 radio:bayangBox(circle(12,12,7.65)+circle(12,12,2.5),circle(12,12,2.5)),
 contrast:bayangBox(circle(12,12,7.5)+'M12 4.5v15',contrastArc),
 keyboard:bayangBox(rr(3.5,6,17,12,2.2)+keys,'M3.7 13H20.3V15.8Q20.3 18 18.1 18H5.9Q3.7 18 3.7 15.8Z'),
 layers:bayangBox('M3.5 8 12 3.5 20.5 8 12 12.5ZM3.5 12 12 16.5 20.5 12M3.5 16 12 20.5 20.5 16','M3.5 8 12 3.5 20.5 8 12 12.5Z'),
 camera:bayangBox('M3.5 8.5Q3.5 6.5 5.5 6.5H8L9.8 4.5H14.2L16 6.5H18.5Q20.5 6.5 20.5 8.5V17Q20.5 19 18.5 19H5.5Q3.5 19 3.5 17Z'+circle(12,12.5,3.3),circle(12,12.5,3.3)),
 'event-workshop':bayangBox(overrides.tipis['event-workshop'],rr(3.6,5.3,16.8,12.1,1.4)),
}
function faceted(items){
  return items.map(({segs,closed})=>{
    // True circular enclosures take eight facets; organic curves stay curved.
    if(closed&&segs.length===4&&segs.every(s=>s.length===4)){
      const anchors=segs.map(s=>s[0]), center=anchors.reduce((a,b)=>[a[0]+b[0]/4,a[1]+b[1]/4],[0,0]);
      const r=dist(anchors[0],center);
      if(r>=4.8&&anchors.every((a,i)=>Math.abs(dist(a,center)-r)<.06&&Math.abs(dist(a,anchors[(i+1)%4])-r*Math.SQRT2)<.09)){
        const pts=segs.flatMap(s=>[s[0],curve(s,.5)]);
        return {segs:pts.map((a,i)=>[a,pts[(i+1)%pts.length]]),closed:true};
      }
    }
    const corners=segs.map((s,i)=>{
      if(s.length!==4||dist(s[0],end(s))>5) return s
      const prev=segs[i-1]??(closed?segs.at(-1):null), next=segs[i+1]??(closed?segs[0]:null)
      if(prev?.length!==2||next?.length!==2)return s
      const [a,b,c,d]=s,u=[b[0]-a[0],b[1]-a[1]],v=[d[0]-c[0],d[1]-c[1]]
      if(Math.abs(u[0]*v[0]+u[1]*v[1])>.19*Math.hypot(...u)*Math.hypot(...v))return s
      return [a,d]
    })
    const trim=segs.map((s,i)=>{
      const prev=segs[i-1]??(closed?segs.at(-1):null)
      if(s.length!==2||prev?.length!==2||prev===s)return 0
      const a=prev[0], b=s[0], c=end(s), l=dist(a,b), r=dist(b,c)
      if(l<2.5||r<2.5)return 0
      const cosine=((a[0]-b[0])*(c[0]-b[0])+(a[1]-b[1])*(c[1]-b[1]))/(l*r)
      return cosine>-.6&&cosine<.76?Math.min(2.1,l*.32,r*.32):0
    })
    const out=[]
    corners.forEach((s,i)=>{
      if(s.length!==2){out.push(s);return}
      const l=dist(...s), next=trim[i+1]??(closed?trim[0]:0)
      const a=trim[i]?lerp(s[0],s[1],trim[i]/l):s[0],b=next?lerp(s[1],s[0],next/l):s[1]
      out.push([a,b]);if(next){const t=corners[(i+1)%corners.length];out.push([b,lerp(t[0],t[1],next/dist(...t))])}
    })
    return {segs:out,closed}
  })
}
function pixel(items,slug){
  const cells=new Uint8Array(256), u=1.5
  const set=(a,b)=>{if(a>=0&&a<16&&b>=0&&b<16)cells[b*16+a]=1}
  const q=n=>Math.floor(n/u)
  for(const {segs} of items) for(const s of segs) {
    if(dist(s[0],end(s))<.11&&s.length===2){set(q(s[0][0]),q(s[0][1]));continue}
    const extent=s.slice(1).reduce((a,b,i)=>a+dist(s[i],b),0), steps=Math.max(2,Math.ceil(extent*2))
    set(q(s[0][0]), q(s[0][1]))
    for(let i=1;i<=steps;i++){
      const at=curve(s,i/steps), x=q(at[0]),y=q(at[1]);set(x,y)
    }
  }
  const setR=(x,y,w,h)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)set(i,j)}
  if(['arrow-up-right','arrow-down-left'].includes(slug)){
    cells.fill(0);setR(6,3,7,1);setR(12,3,1,7)
    for(let i=0;i<=8;i++)set(3+i,12-i)
    if(slug==='arrow-down-left') cells.reverse()
  }
  if(['toggle-on','toggle-off'].includes(slug)){
    cells.fill(0);setR(4,5,8,1);setR(4,10,8,1);setR(3,6,1,4);setR(12,6,1,4);setR(slug==='toggle-on'?9:5,7,2,2)
  }
  if(slug==='keyboard'){
    cells.fill(0);setR(3,4,10,1);setR(3,11,10,1);setR(2,5,1,6);setR(13,5,1,6);[4,6,9,11].forEach(x=>set(x,6));setR(5,9,6,1)
  }
  if(slug==='checkbox'){
    cells.fill(0);setR(4,2,8,1);setR(4,13,8,1);setR(2,4,1,8);setR(13,4,1,8);[[3,3],[12,3],[3,12],[12,12],[5,8],[6,9],[7,10],[8,9],[9,8],[10,7],[11,6]].forEach(([a,b])=>set(a,b))
  }
  if(slug==='layers'){
    cells.fill(0);
    for(const [dy,top] of [[0,true],[2,false],[5,false]]){
      for(let x=2;x<=13;x++){
        const y=6-Math.round((5.5-Math.abs(7.5-x))*.52);
        if(top)set(x,y);
        set(x,12-y+dy);
      }
    }
  }
  if(slug==='event-workshop'){
    cells.fill(0);setR(2,3,12,1);setR(2,10,12,1);setR(2,3,1,8);setR(13,3,1,8);
    setR(7,11,2,2);setR(5,13,6,1);
    [[5,5],[4,6],[6,6],[5,7],[10,5],[9,6],[10,6],[11,6],[10,7]].forEach(([a,b])=>set(a,b));
  }
  let d=''
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){
    if(!cells[y*16+x])continue
    let w=1,h=1
    while(x+w<16&&cells[y*16+x+w])w++
    while(y+h<16&&Array.from({length:w},(_,j)=>cells[(y+h)*16+x+j]).every(Boolean))h++
    for(let b=y;b<y+h;b++)for(let a=x;a<x+w;a++)cells[b*16+a]=0
    d+=tile(x*u,y*u,w*u,h*u)
  }
  return d
}
export function modernGeometry(icon, id, legacyGeometry) {
  const {slug,path,x,y}=icon, items=parse(path,x,y)
  const master=items.map(encode).join('')
  if(id==='bold'){
    if(boldMixed[slug])return boldMixed[slug]
    if(solids[slug])return [layer(solids[slug],0,{evenOdd:true})]
    const complexity=items.reduce((sum,i)=>sum+i.segs.length,0)
    const density=complexity>25||items.length>=6
    return [layer(master,density?2.35:2.6)]
  }
  if(id==='bayang'){
    if(shadows[slug])return shadows[slug]
    const closed=items.filter(i=>i.closed).map(encode).join('')
    if(closed)return bayangBox(master,closed)
    const primary=[...items].sort((a,b)=>b.segs.reduce((l,s)=>l+dist(s[0],end(s)),0)-a.segs.reduce((l,s)=>l+dist(s[0],end(s)),0))[0]
    return [layer(encode(primary),3.25,{opacity:.22}),layer(master,1.7)]
  }
  if(id==='piksel')return [layer(pixel(items,slug),0)]
  if(overrides[id]?.[slug])return [layer(overrides[id][slug],weight[id],id === 'potong-serong' && !overrides[id][slug].endsWith('.01')?{strokeJoin:'bevel'}:{})]
  if(id==='tipis')return [layer(master,weight[id])]
  if(id==='potong-serong'){
    const facet=faceted(items).map(encode).join('')
    if(facet!==master)return [layer(facet,weight[id],{strokeJoin:'bevel'})]
    const derived=legacyGeometry(icon, id)
    return [layer(derived.path,weight[id],{x:derived.x,y:derived.y,strokeJoin:'bevel'})]
  }
  const derived=legacyGeometry(icon, id)
  return [layer(derived.path,weight[id],{x:derived.x,y:derived.y})]
}
