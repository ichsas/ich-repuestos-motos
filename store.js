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
 function downloadCatalogPdf(){
  if(!products.length){alert("Todavía no hay productos visibles para incluir en el catálogo.");return}
  const printWindow=window.open("", "_blank");
  if(!printWindow){alert("El navegador bloqueó la ventana del catálogo. Permite las ventanas emergentes para este sitio e inténtalo de nuevo.");return}
  const rows=[...products].sort((a,b)=>(a.nombre||"").localeCompare(b.nombre||"","es"));
  const logo=new URL("assets/ich-logo.png",window.location.href).href;
  const cards=rows.map(p=>{
   const img=Array.isArray(p.imagenes)?p.imagenes[0]:"";
   const image=img?`<img class="product-photo" src="${esc(img)}" alt="${esc(p.nombre)}">`:`<div class="no-photo">ICH</div>`;
   const details=[p.referencia?`Referencia: ${esc(p.referencia)}`:"",p.categorias?.nombre?`Categoría: ${esc(p.categorias.nombre)}`:"",p.marcas?.nombre?`Marca: ${esc(p.marcas.nombre)}`:""].filter(Boolean).join("<br>");
   return `<article class="product-card">${image}<div class="product-data"><h2>${esc(p.nombre)}</h2><p>${details||"Repuesto para motocicleta"}</p>${p.descripcion?`<p class="description">${esc(p.descripcion)}</p>`:""}<strong>${money(p.precio)}</strong></div></article>`;
  }).join("");
  const date=new Intl.DateTimeFormat("es-CO",{dateStyle:"long"}).format(new Date());
  const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Catálogo ICH REPUESTOS</title><style>
   @page{size:A4;margin:12mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#171717;margin:0}.header{display:flex;align-items:center;gap:14px;border-bottom:3px solid #e51f2b;padding:0 0 12px;margin-bottom:18px}.logo{width:70px;height:60px;object-fit:contain}.brand h1{font-size:23px;margin:0;font-weight:900}.brand p{font-size:10px;letter-spacing:2px;margin:3px 0 0}.meta{margin-left:auto;text-align:right;font-size:10px;color:#666}.intro{margin:0 0 16px}.intro h2{font-size:16px;margin:0 0 4px}.intro p{font-size:10px;color:#666;margin:0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.product-card{border:1px solid #ddd;border-radius:5px;overflow:hidden;display:flex;gap:10px;padding:9px;break-inside:avoid;page-break-inside:avoid;min-height:126px}.product-photo,.no-photo{width:105px;height:105px;flex:0 0 105px;object-fit:contain;background:#f6f6f6;border-radius:3px}.no-photo{display:grid;place-items:center;font-weight:bold;color:#999}.product-data{min-width:0}.product-data h2{font-size:12px;line-height:1.25;margin:2px 0 6px;text-transform:uppercase}.product-data p{font-size:9px;line-height:1.45;color:#555;margin:0 0 5px;overflow-wrap:anywhere}.product-data .description{font-style:italic}.product-data strong{display:block;color:#d91f2b;font-size:13px;margin-top:7px}.footer{border-top:1px solid #ddd;margin-top:18px;padding-top:8px;text-align:center;font-size:9px;color:#777}@media(max-width:600px){.grid{grid-template-columns:1fr}.product-card{min-height:110px}.product-photo,.no-photo{width:90px;height:90px;flex-basis:90px}}@media print{.product-card{break-inside:avoid}}
  </style></head><body><header class="header"><img class="logo" src="${logo}" alt="ICH"><div class="brand"><h1>ICH REPUESTOS</h1><p>REPUESTOS PARA MOTOS</p></div><div class="meta">CATÁLOGO DE PRODUCTOS<br>${date}<br>${rows.length} productos</div></header><section class="intro"><h2>Catálogo de repuestos y accesorios</h2><p>Consulta las referencias, características y precios de nuestros productos.</p></section><main class="grid">${cards}</main><footer class="footer">ICH REPUESTOS PARA MOTOS · Precios expresados en pesos colombianos (COP)</footer><script>window.onload=()=>setTimeout(()=>window.print(),700);</script></body></html>`;
  printWindow.document.open();printWindow.document.write(html);printWindow.document.close();
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
 $("download-catalog-pdf").onclick=downloadCatalogPdf;
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