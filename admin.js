(() => {
 const C=window.ICH_CONFIG||{}, $=id=>document.getElementById(id);
 const ready=window.supabase&&C.supabaseUrl?.startsWith("https://")&&!C.supabaseUrl.includes("PEGA_AQUI")&&C.supabaseAnonKey?.length>20;
 const db=ready?window.supabase.createClient(C.supabaseUrl,C.supabaseAnonKey):null;
 let products=[],categories=[],brands=[],motos=[];
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const money=n=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(Number(n)||0);
 const say=(id,t)=>$(id).textContent=t||"";
 const show=ok=>{$("login-panel").classList.toggle("hidden",ok);$("dashboard").classList.toggle("hidden",!ok)};
 const options=(id,rows,empty)=>{$(id).innerHTML=`<option value="">${empty}</option>`+rows.map(x=>`<option value="${x.id}">${esc(x.nombre)}</option>`).join("")};
 document.querySelectorAll(".admin-tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".admin-tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".admin-panel").forEach(x=>x.classList.toggle("hidden",x.id!==b.dataset.tab))});
 async function loadRefs(){
  const [c,b,m]=await Promise.all([db.from("categorias").select("id,nombre").order("nombre"),db.from("marcas").select("id,nombre").order("nombre"),db.from("motocicletas").select("id,marca,modelo,anio_desde,anio_hasta").order("marca").order("modelo")]);
  for(const r of [c,b,m])if(r.error)throw r.error;
  categories=c.data||[];brands=b.data||[];motos=m.data||[];
  options("p-category",categories,"Selecciona categoría");options("p-brand",brands,"Sin marca");renderBrands();renderMotos();
 }
 async function loadProducts(){
  const r=await db.from("productos").select("id,referencia,nombre,descripcion,categoria_id,marca_id,precio,imagenes,activo,created_at,categorias(nombre),marcas(nombre)").order("created_at",{ascending:false});
  if(r.error)throw r.error;products=r.data||[];renderProducts();
 }
 function renderProducts(){
  const q=$("admin-search").value.toLowerCase();
  const rows=products.filter(p=>[p.nombre,p.referencia,p.categorias?.nombre,p.marcas?.nombre].join(" ").toLowerCase().includes(q));
  $("admin-count").textContent=products.length;
  $("inventory-list").innerHTML=rows.length?rows.map(p=>{const img=Array.isArray(p.imagenes)?p.imagenes[0]:"";return `<div class="inventory-item">${img?`<img src="${esc(img)}">`:'<img src="assets/ich-logo.png">'}<div><b>${esc(p.nombre)}</b><small>${esc(p.referencia||"Sin referencia")} · ${money(p.precio)} · ${p.activo?"Visible":"Oculto"}</small></div><div class="inventory-actions"><button data-pe="${p.id}">Editar</button><button class="delete" data-pd="${p.id}">Borrar</button></div></div>`}).join(""):'<p class="muted">No hay productos.</p>';
 }
 function renderBrands(){
  const q=$("brand-search").value.toLowerCase(),rows=brands.filter(b=>b.nombre.toLowerCase().includes(q));
  $("brand-count").textContent=brands.length;options("p-brand",brands,"Sin marca");
  $("brand-list").innerHTML=rows.length?rows.map(b=>`<div class="inventory-item"><div class="brand-avatar">M</div><div><b>${esc(b.nombre)}</b><small>Marca</small></div><div class="inventory-actions"><button data-be="${b.id}">Editar</button><button class="delete" data-bd="${b.id}">Borrar</button></div></div>`).join(""):'<p class="muted">No hay marcas registradas.</p>';
 }
 function renderMotos(){
  const q=$("motorcycle-search").value.toLowerCase(),rows=motos.filter(m=>[m.marca,m.modelo,m.anio_desde,m.anio_hasta].join(" ").toLowerCase().includes(q));
  $("motorcycle-count").textContent=motos.length;
  $("motorcycle-list").innerHTML=rows.length?rows.map(m=>`<div class="inventory-item"><div class="brand-avatar">🏍</div><div><b>${esc(m.marca)} ${esc(m.modelo)}</b><small>${m.anio_desde||"—"} a ${m.anio_hasta||"Actual"}</small></div><div class="inventory-actions"><button data-me="${m.id}">Editar</button><button class="delete" data-md="${m.id}">Borrar</button></div></div>`).join(""):'<p class="muted">No hay motocicletas registradas.</p>';
 }
 async function upload(file){
  if(!file)return null;if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw Error("Usa una imagen JPG, PNG o WEBP.");if(file.size>8*1024*1024)throw Error("La imagen debe pesar menos de 8 MB.");
  const ext=file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g,""),path=`${crypto.randomUUID()}.${ext}`;
  const r=await db.storage.from("product-images").upload(path,file,{contentType:file.type});if(r.error)throw r.error;return db.storage.from("product-images").getPublicUrl(path).data.publicUrl;
 }
 $("login-form").onsubmit=async e=>{e.preventDefault();if(!db){say("login-message","Configura SUPABASE_URL y SUPABASE_ANON_KEY en config.js.");return}say("login-message","Ingresando...");const r=await db.auth.signInWithPassword({email:$("login-email").value.trim(),password:$("login-password").value});if(r.error){say("login-message",r.error.message);return}show(true);try{await loadRefs();await loadProducts()}catch(x){say("global-message",x.message)}};
 $("logout").onclick=async()=>{await db.auth.signOut();show(false)};
 $("product-form").onsubmit=async e=>{e.preventDefault();say("product-message","Guardando...");try{const id=$("product-id").value,old=products.find(p=>String(p.id)===id);let imgs=old?.imagenes||[];const file=$("p-image").files[0];if(file){const url=await upload(file);if(url)imgs=[url]}const row={nombre:$("p-name").value.trim(),referencia:$("p-reference").value.trim()||null,precio:Number($("p-price").value)||0,categoria_id:$("p-category").value,marca_id:$("p-brand").value||null,descripcion:$("p-description").value.trim()||null,imagenes:imgs,activo:$("p-active").checked,updated_at:new Date().toISOString()};if(!row.categoria_id)throw Error("Selecciona una categoría.");const r=id?await db.from("productos").update(row).eq("id",id):await db.from("productos").insert(row);if(r.error)throw r.error;$("product-form").reset();$("product-id").value="";$("p-active").checked=true;$("form-title").textContent="Agregar producto";say("product-message","Producto guardado.");await loadProducts()}catch(x){say("product-message",x.message)}};
 $("cancel-edit").onclick=()=>{$("product-form").reset();$("product-id").value="";$("p-active").checked=true;$("form-title").textContent="Agregar producto";say("product-message","")};
 $("admin-search").oninput=renderProducts;
 $("inventory-list").onclick=async e=>{const ed=e.target.closest("[data-pe]"),del=e.target.closest("[data-pd]");if(ed){const p=products.find(x=>String(x.id)===ed.dataset.pe);$("product-id").value=p.id;$("p-name").value=p.nombre||"";$("p-reference").value=p.referencia||"";$("p-price").value=p.precio||0;$("p-category").value=p.categoria_id;$("p-brand").value=p.marca_id||"";$("p-description").value=p.descripcion||"";$("p-active").checked=!!p.activo;$("form-title").textContent="Editar producto";window.scrollTo(0,0)}if(del&&confirm("¿Eliminar este producto?")){const r=await db.from("productos").delete().eq("id",del.dataset.pd);if(r.error)say("product-message",r.error.message);else await loadProducts()}};
 $("brand-form").onsubmit=async e=>{e.preventDefault();const id=$("brand-id").value,nombre=$("brand-name").value.trim();say("brand-message","Guardando...");const r=id?await db.from("marcas").update({nombre}).eq("id",id):await db.from("marcas").insert({nombre});if(r.error){say("brand-message",r.error.message);return}$("brand-form").reset();$("brand-id").value="";$("brand-form-title").textContent="Agregar marca";const b=await db.from("marcas").select("id,nombre").order("nombre");if(b.error){say("brand-message",b.error.message);return}brands=b.data||[];renderBrands();say("brand-message","Marca guardada correctamente.")};
 $("brand-clear").onclick=()=>{$("brand-form").reset();$("brand-id").value="";$("brand-form-title").textContent="Agregar marca";say("brand-message","")};$("brand-search").oninput=renderBrands;
 $("brand-list").onclick=async e=>{const ed=e.target.closest("[data-be]"),del=e.target.closest("[data-bd]");if(ed){const b=brands.find(x=>String(x.id)===ed.dataset.be);$("brand-id").value=b.id;$("brand-name").value=b.nombre;$("brand-form-title").textContent="Editar marca"}if(del&&confirm("Se borrará solo si no tiene productos asociados.")){const ck=await db.from("productos").select("id",{count:"exact",head:true}).eq("marca_id",del.dataset.bd);if(ck.error){say("brand-message",ck.error.message);return}if(ck.count){say("brand-message","No se puede borrar: hay productos asociados.");return}const r=await db.from("marcas").delete().eq("id",del.dataset.bd);if(r.error)say("brand-message",r.error.message);else{brands=brands.filter(x=>String(x.id)!==del.dataset.bd);renderBrands();say("brand-message","Marca eliminada.")}}};
 $("motorcycle-form").onsubmit=async e=>{e.preventDefault();const id=$("motorcycle-id").value,from=$("m-year-from").value,to=$("m-year-to").value;if(from&&to&&+to<+from){say("motorcycle-message","Año hasta no puede ser menor que año desde.");return}const row={marca:$("m-brand").value.trim(),modelo:$("m-model").value.trim(),anio_desde:from?+from:null,anio_hasta:to?+to:null};say("motorcycle-message","Guardando...");const r=id?await db.from("motocicletas").update(row).eq("id",id):await db.from("motocicletas").insert(row);if(r.error){say("motorcycle-message",r.error.message);return}$("motorcycle-form").reset();$("motorcycle-id").value="";$("motorcycle-form-title").textContent="Agregar motocicleta";const m=await db.from("motocicletas").select("id,marca,modelo,anio_desde,anio_hasta").order("marca").order("modelo");if(m.error){say("motorcycle-message",m.error.message);return}motos=m.data||[];renderMotos();say("motorcycle-message","Motocicleta guardada correctamente.")};
 $("motorcycle-clear").onclick=()=>{$("motorcycle-form").reset();$("motorcycle-id").value="";$("motorcycle-form-title").textContent="Agregar motocicleta";say("motorcycle-message","")};$("motorcycle-search").oninput=renderMotos;
 $("motorcycle-list").onclick=async e=>{const ed=e.target.closest("[data-me]"),del=e.target.closest("[data-md]");if(ed){const m=motos.find(x=>String(x.id)===ed.dataset.me);$("motorcycle-id").value=m.id;$("m-brand").value=m.marca;$("m-model").value=m.modelo;$("m-year-from").value=m.anio_desde??"";$("m-year-to").value=m.anio_hasta??"";$("motorcycle-form-title").textContent="Editar motocicleta"}if(del&&confirm("¿Eliminar esta motocicleta?")){const r=await db.from("motocicletas").delete().eq("id",del.dataset.md);if(r.error)say("motorcycle-message",r.error.message);else{motos=motos.filter(x=>String(x.id)!==del.dataset.md);renderMotos()}}};
 if(!ready){show(false);say("login-message","Falta configurar la conexión de Supabase en config.js.");}else db.auth.getSession().then(async({data})=>{if(data.session){show(true);try{await loadRefs();await loadProducts()}catch(x){say("global-message",x.message)}}});
})();