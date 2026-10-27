// ---- Data: replace this with your API / database ----
const COUPONS={SAVE10:.10,FIRST20:.20};
const $=id=>document.getElementById(id);
const rs=n=>"₹"+n.toLocaleString("en-IN");
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};

let cart=load("cart",{}), wish=load("wish",[]), cat="All", sort="rel", wishOnly=false, coupon=load("coupon","");

function toast(m){const t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),1800)}

function renderCats(){
  const cats=["All",...new Set(PRODUCTS.map(p=>p.cat))];
  $("cats").innerHTML=cats.map(c=>`<button class="chip" aria-pressed="${c===cat}" data-c="${c}">${c}</button>`).join("")+
   `<select id="sort" aria-label="Sort"><option value="rel">Relevance</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option><option value="rt">Top rated</option></select>`;
  $("sort").value=sort;
}
function renderGrid(){
  const q=$("q").value.trim().toLowerCase();
  let list=PRODUCTS.filter(p=>(cat==="All"||p.cat===cat)&&p.name.toLowerCase().includes(q)&&(!wishOnly||wish.includes(p.id)));
  if(sort==="lo")list.sort((a,b)=>a.price-b.price);
  if(sort==="hi")list.sort((a,b)=>b.price-a.price);
  if(sort==="rt")list.sort((a,b)=>b.rate-a.rate);
  $("grid").innerHTML=list.length?list.map(p=>`
   <article class="card">
    <div class="pic" data-v="${p.id}" style="background:${p.bg};cursor:pointer">${p.em}
     <button class="wish" data-w="${p.id}" aria-label="Toggle wishlist">${wish.includes(p.id)?"♥":"♡"}</button></div>
    <div class="info"><h3 data-v="${p.id}" style="cursor:pointer">${p.name}</h3><div class="rate">★ ${p.rate}</div>
     <div class="price">${rs(p.price)}<s>${rs(p.mrp)}</s><span class="off">${Math.round(100-p.price*100/p.mrp)}% off</span></div>
     <button class="add" data-a="${p.id}">Add to cart</button></div>
   </article>`).join(""):`<div class="empty">No products found. Try a different search or category.</div>`;
  $("wc").textContent=wish.length;
}
function totals(){
  let sub=0;for(const id in cart){const p=PRODUCTS.find(x=>x.id==id);sub+=p.price*cart[id]}
  const disc=Math.round(sub*(COUPONS[coupon]||0)), ship=sub-disc>=999||!sub?0:49;
  return{sub,disc,ship,tot:sub-disc+ship};
}
function renderCart(){
  const ids=Object.keys(cart), n=ids.reduce((a,i)=>a+cart[i],0);
  $("cc").textContent=n;
  $("items").innerHTML=ids.length?ids.map(id=>{const p=PRODUCTS.find(x=>x.id==id);return`
   <div class="row"><div class="em" style="background:${p.bg}">${p.em}</div>
    <div class="t"><b>${p.name}</b><div>${rs(p.price)}</div>
     <div class="qty"><button data-m="${id}" aria-label="Decrease">−</button><span>${cart[id]}</span><button data-p="${id}" aria-label="Increase">+</button></div></div>
    <button class="ib" data-r="${id}" aria-label="Remove">🗑</button></div>`}).join(""):`<div class="empty">Your cart is empty. Add something from the store.</div>`;
  const t=totals();
  $("sub").textContent=rs(t.sub);$("disc").textContent=t.disc?"− "+rs(t.disc):"–";
  $("ship").textContent=t.ship?rs(t.ship):"Free";$("tot").textContent=rs(t.tot);
  $("co").disabled=!ids.length;
  save("cart",cart);
}
function openCart(o){$("cart").classList.toggle("on",o);$("shade").classList.toggle("on",o);if(o){$("ft").classList.remove("hide");$("form").classList.add("hide")}}

document.addEventListener("click",e=>{
  const d=e.target.closest("[data-c],[data-w],[data-a],[data-m],[data-p],[data-r]");if(!d)return;
  const D=d.dataset;
  if(D.c){cat=D.c;wishOnly=false;renderCats();renderGrid()}
  if(D.w){const id=+D.w;wish=wish.includes(id)?wish.filter(x=>x!==id):[...wish,id];save("wish",wish);renderGrid()}
  if(D.a){cart[D.a]=(cart[D.a]||0)+1;renderCart();toast("Added to cart")}
  if(D.p){cart[D.p]++;renderCart()}
  if(D.m){if(--cart[D.m]<=0)delete cart[D.m];renderCart()}
  if(D.r){delete cart[D.r];renderCart()}
});
document.addEventListener("change",e=>{if(e.target.id==="sort"){sort=e.target.value;renderGrid()}});
$("q").addEventListener("input",renderGrid);
$("cbtn").onclick=()=>openCart(true);
$("close").onclick=$("shade").onclick=()=>openCart(false);
$("wbtn").onclick=()=>{wishOnly=!wishOnly;cat="All";renderCats();renderGrid();toast(wishOnly?"Showing wishlist":"Showing all products")};
$("apply").onclick=()=>{const c=$("code").value.trim().toUpperCase();
  if(COUPONS[c]){coupon=c;save("coupon",c);toast("Coupon applied");renderCart()}else toast("Invalid coupon code")};
$("co").onclick=()=>{if(!user){openCart(false);openAuth("login");toast("Log in to checkout");return}$("nm").value=user.name;$("ft").classList.add("hide");$("form").classList.remove("hide")};
$("back").onclick=()=>{$("form").classList.add("hide");$("ft").classList.remove("hide")};
$("place").onclick=()=>{
  if(!$("form").reportValidity())return;
  const id="BZ"+Date.now().toString().slice(-6);
  // TODO: send {name,address,phone,cart,coupon} to your backend here
  const t=totals();orders.push({id,user:user.email,name:user.name,ts:Date.now(),status:"Placed",date:new Date().toLocaleDateString("en-IN"),total:t.tot,items:Object.keys(cart).map(i=>PRODUCTS.find(x=>x.id==i).name+" × "+cart[i])});save("orders",orders);
  cart={};coupon="";save("coupon","");renderCart();openCart(false);
  toast("Order "+id+" placed. Thank you!");
};
$("theme").onclick=()=>{
  const dark=document.documentElement.dataset.theme==="dark"||(!document.documentElement.dataset.theme&&matchMedia("(prefers-color-scheme:dark)").matches);
  document.documentElement.dataset.theme=dark?"light":"dark";save("theme",dark?"light":"dark");
};
const th=load("theme",null);if(th)document.documentElement.dataset.theme=th;

// ---- Auth (demo only: stored in this browser. Replace with real backend auth in production) ----
let users=load("users",[]),user=load("session",null),orders=load("orders",[]);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function hash(s){try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}catch(e){return btoa(s)}}
const modal=$("modal"),box=$("box");
function openModal(h){box.innerHTML=h+'<button class="x" onclick="closeModal()" aria-label="Close">✕</button>';modal.classList.add("on")}
function closeModal(){modal.classList.remove("on")}
modal.onclick=e=>{if(e.target===modal)closeModal()};
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();openCart(false)}});
function openAuth(mode){
 const s=mode==="signup";
 openModal(`<h2>${s?"Create account":"Welcome back"}</h2><form id="af" class="af">${s?'<input id="an" placeholder="Full name" required>':''}<input id="ae" type="email" placeholder="Email" required><input id="ap" type="password" placeholder="Password (min 6 characters)" minlength="6" required><div class="err" id="aerr"></div><button class="add">${s?"Sign up":"Log in"}</button></form><p class="sw">${s?"Already have an account?":"New here?"} <a href="#" id="sw">${s?"Log in":"Create an account"}</a></p>`);
 $("sw").onclick=e=>{e.preventDefault();openAuth(s?"login":"signup")};
 $("af").onsubmit=async e=>{e.preventDefault();const em=$("ae").value.trim().toLowerCase(),h=await hash($("ap").value),err=$("aerr");
  if(s){if(users.some(u=>u.email===em))return err.textContent="This email is already registered. Log in instead.";
   const u={name:$("an").value.trim(),email:em,h};users.push(u);save("users",users);login(u)}
  else{const u=users.find(u=>u.email===em&&u.h===h);if(!u)return err.textContent="Email or password is incorrect.";login(u)}};
}
function login(u){user={name:u.name,email:u.email};save("session",user);closeModal();renderUser();toast("Welcome, "+u.name.split(" ")[0]+"!")}
function renderUser(){$("ubtn").textContent=user?"👤 "+user.name.split(" ")[0]:"Log in"}
$("ubtn").onclick=()=>{if(!user)return openAuth("login");
 openModal(`<h2>Hi, ${esc(user.name)}</h2><p class="mut">${esc(user.email)}</p><button class="add" id="mo">My orders</button>${users[0]&&users[0].email===user.email?'<a class="add out" href="dashboard.html" style="text-align:center;text-decoration:none">Admin dashboard</a>':''}<button class="add out" id="lo">Log out</button>`);
 $("mo").onclick=showOrders;$("lo").onclick=()=>{user=null;save("session",null);closeModal();renderUser();toast("Logged out")}};
function showOrders(){const o=orders.filter(x=>x.user===user.email).reverse();
 openModal(`<h2>My orders</h2>`+(o.length?o.map(x=>`<div class="ord"><b>${x.id}</b><span class="mut">${x.date}</span><div>${x.items.map(esc).join(", ")}</div><b>${rs(x.total)}</b></div>`).join(""):'<p class="mut">No orders yet. Your orders will show up here.</p>'))}

// ---- Product details ----
const DESC={1:"Active noise cancelling, 24-hour battery and quick pairing.",2:"Heart-rate tracking, 7-day battery and water resistance.",3:"Loud, clear sound with 12 hours of playtime.",4:"Soft 100% cotton, regular fit, machine washable.",5:"Light cushioned soles for daily runs and walks.",6:"Water-resistant, padded laptop sleeve, 25 litres.",7:"Keeps drinks cold for 24 hours and hot for 12.",8:"Adjustable brightness with an eye-care LED.",9:"Set of 4 ceramic mugs, dishwasher safe.",10:"Pack of 3 ruled notebooks, 200 pages each.",11:"6mm non-slip mat with carry strap.",12:"Rubber-coated hex dumbbells, 5kg each."};
document.addEventListener("click",e=>{const v=e.target.closest("[data-v]");if(!v||e.target.closest("[data-w]"))return;
 const p=PRODUCTS.find(x=>x.id==v.dataset.v),rel=PRODUCTS.filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,3);
 openModal(`<div class="pd"><div class="big" style="background:${p.bg}">${p.em}</div><div><h2>${p.name}</h2><div class="rate">★ ${p.rate} · ${p.cat}</div><p>${DESC[p.id]}</p><div class="price">${rs(p.price)}<s>${rs(p.mrp)}</s></div><button class="add" id="pa" style="width:100%">Add to cart</button></div></div>`+(rel.length?`<h3>More in ${p.cat}</h3><div class="rel">${rel.map(r=>`<button class="chip" data-v="${r.id}">${r.em} ${r.name}</button>`).join("")}</div>`:""));
 $("pa").onclick=()=>{cart[p.id]=(cart[p.id]||0)+1;renderCart();closeModal();toast("Added to cart")}});

// ---- Deal countdown + newsletter ----
function tick(){const n=new Date(),e=new Date(n);e.setHours(24,0,0,0);const s=Math.floor((e-n)/1000);$("cd").textContent="Ends in "+[s/3600|0,s/60%60|0,s%60].map(x=>String(x).padStart(2,"0")).join(":")}
tick();setInterval(tick,1000);
$("nl").onsubmit=e=>{e.preventDefault();e.target.reset();toast("Subscribed. Thank you!")};
renderUser();
renderCats();renderGrid();renderCart();
