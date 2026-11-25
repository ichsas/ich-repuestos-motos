(() => {
 const C=window.ICH_CONFIG||{},$=id=>document.getElementById(id);
 const ready=window.supabase&&C.supabaseUrl?.startsWith("https://")&&!C.supabaseUrl.includes("PEGA_AQUI")&&C.supabaseAnonKey?.length>20;
 const db=ready?window.supabase.createClient(C.supabaseUrl,C.supabaseAnonKey):null;
 let products=[],categories=[],cart=[],selected="all";
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const money=n=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(Number(n)||0);
 $("year").textContent=new Date().getFullYear();
 function renderCategories(){
  const icons=["⚙","⚡","◉","⛓","◌","↕","✦","⌁","▦"];
  $("category-list").innerHTML=`<button class="category-card ${selected==="all"?"active":""}" data-category="all"><span class="cat-icon">▦</span>Todos</button>`+categories.map((c,i)=>`<button class="category-card ${selected===c.id?"active":""}" data-category="${c.id}"><span class="cat-icon">${icons[i%icons.length]}</span>${esc(c.nombre)}</button>`).join("");
 }
 function renderBrands(){
  const brands=[...new Set(products.map(p=>p.marcas?.nombre).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
  $("brand-filter").innerHTML='<option value="">Todas las marcas</option>'+brands.map(b=>`<option value="${esc(b)}">${esc(b)}</option>`).join("");
 }
 function renderProducts(){
  let list=products.filter(p=>(selected==="all"||p.categoria_id===selected)&&(!$("brand-filter").value||p.marcas?.nombre===$("brand-filter").value));
  const q=$("search").value.trim().toLowerCase();
  if(q)list=list.filter(p=>[p.nombre,p.referencia,p.marcas?.nombre,p.descripcion,p.categorias?.nombre].join(" ").toLowerCase().includes(q));
  const sort=$("sort").value;if(sort==="name")list.sort((a,b)=>(a.nombre||"").localeCompare(b.nombre||""));if(sort==="price-asc")list.sort((a,b)=>a.precio-b.precio);if(sort==="price-desc")list.sort((a,b)=>b.precio-a.precio);
  const cat=categories.find(c=>c.id===selected);
  $("catalog-title").textContent=selected==="all"?"Todos los productos":cat?.nombre||"Productos";
  $("product-total").textContent=`${list.length} producto${list.length===1?"":"s"}`;
  $("product-grid").innerHTML=list.length?list.map(p=>{const img=Array.isArray(p.imagenes)?p.imagenes[0]:"";return `<article class="product-card"><div class="product-image">${img?`<img src="${esc(img)}" alt="${esc(p.nombre)}" loading="lazy">`:'<span class="no-photo">🏍</span>'}</div><div class="product-info"><span class="product-category">${esc(p.categorias?.nombre||"Repuesto")}</span><h3>${esc(p.nombre)}</h3><span class="product-ref">${p.referencia?"Ref. "+esc(p.referencia):"Referencia no especificada"}</span><b class="product-price">${money(p.precio)}</b><span class="product-stock">${p.activo===false?"No disponible":"Disponible"}</span><button class="add-button" data-add="${p.id}" ${p.activo===false?"disabled":""}>AGREGAR AL CARRITO</button></div></article>`}).join(""):'<div class="empty-state"><b>No encontramos productos</b><p>Prueba con otra categoría o palabra de búsqueda.</p></div>';
 }
 function renderCart(){
  $("cart-count").textContent=cart.reduce((n,x)=>n+x.qty,0);
  $("cart-items").innerHTML=cart.length?cart.map(x=>`<div class="cart-row"><div><b>${esc(x.nombre)}</b><br><span>${money(x.precio)} × ${x.qty}</span></div><div><b>${money(x.precio*x.qty)}</b><br><button data-remove="${x.id}">Quitar</button></div></div>`).join(""):'<p class="muted">Todavía no has agregado productos.</p>';
  $("cart-total").textContent=money(cart.reduce((n,x)=>n+x.precio*x.qty,0));
 }
 async function load(){
  if(!db){$("product-grid").innerHTML='<div class="empty-state"><b>Bienvenido a ICH</b><p>El catálogo se activará al completar la conexión con Supabase.</p></div>';return}
  const [c,p]=await Promise.all([db.from("categorias").select("id,nombre").order("nombre"),db.from("productos").select("id,referencia,nombre,descripcion,categoria_id,marca_id,precio,imagenes,activo,categorias(nombre),marcas(nombre)").eq("activo",true).order("created_at",{ascending:false})]);
  if(c.error||p.error){$("product-grid").innerHTML=`<div class="empty-state"><b>No se pudo cargar el catálogo</b><p>${esc((c.error||p.error).message)}</p></div>`;return}
  categories=c.data||[];products=p.data||[];renderCategories();renderBrands();renderProducts();
 }
 document.addEventListener("click",e=>{
  const cat=e.target.closest("[data-category]");if(cat){selected=cat.dataset.category;renderCategories();renderProducts()}
  const add=e.target.closest("[data-add]");if(add){const p=products.find(x=>String(x.id)===add.dataset.add);if(p){const f=cart.find(x=>x.id===p.id);f?f.qty++:cart.push({...p,qty:1});renderCart()}}
  const remove=e.target.closest("[data-remove]");if(remove){cart=cart.filter(x=>String(x.id)!==remove.dataset.remove);renderCart()}
 });
 $("show-all-top").onclick=()=>{selected="all";renderCategories();renderProducts();$("catalogo").scrollIntoView()};
 $("search").oninput=renderProducts;$("brand-filter").onchange=renderProducts;$("sort").onchange=renderProducts;
 const drawer=$("cart-drawer"),backdrop=$("drawer-backdrop");const open=()=>{drawer.classList.add("open");backdrop.classList.add("open")},close=()=>{drawer.classList.remove("open");backdrop.classList.remove("open")};
 $("open-cart").onclick=open;$("close-cart").onclick=close;backdrop.onclick=close;
 $("checkout").onclick=()=>{
  if(!cart.length){alert("Agrega productos al carrito primero.");return}
  if(!C.whatsappNumber){alert("El número de WhatsApp de ICH aún no está configurado.");return}
  const lines=cart.map(x=>`• ${x.nombre} (${x.referencia||"Sin ref."}) x${x.qty}: ${money(x.precio*x.qty)}`).join("\n");
  const total=money(cart.reduce((n,x)=>n+x.precio*x.qty,0)),msg=encodeURIComponent(`Hola, quiero consultar este pedido en ICH:\n${lines}\nTotal: ${total}`);
  window.open(`https://wa.me/${C.whatsappNumber}?text=${msg}`,"_blank","noopener");
 };
 load();renderCart();
})();