const links=[["index.html","Inicio"],["informacion1.html","Información"],["Bicicletas","Bicicletas a tu alcance"],["graficas.html","Datos estadísticos"],["donaciones.html","Donaciones"]];
const page=location.pathname.split("/").pop()||"index.html";
const main=document.querySelector("main");
const top=document.createElement("header");top.className="top";
top.innerHTML=`<a class="brand" href="index.html">🌱 EcoPuente</a><nav id="nav">${links.map(([h,t])=>`<a href="${h}"${h===page?' class="on"':""}>${t}</a>`).join("")}</nav><div class="ses"><span id="st">No has iniciado sesión</span><button id="out" hidden>Salir</button><button id="bg" aria-label="Abrir menú">☰</button><a id="in" class="lg" href="inicia-sesion.html">Iniciar sesión</a></div>`;
main.before(top);
main.after(Object.assign(document.createElement("footer"),{textContent:"© EcoPuente · Cuidemos el planeta juntos"}));
top.querySelector("#bg").onclick=()=>top.querySelector("#nav").classList.toggle("open");
try{
  const{onUser,logout}=await import("./auth.js");
  onUser((u,rol)=>{
    top.querySelector("#st").textContent=u?`${u.displayName||"Usuario"} · ${rol}`:"No has iniciado sesión";
    top.querySelector("#in").hidden=!!u;
    const o=top.querySelector("#out");o.hidden=!u;o.onclick=()=>logout();
    window.dispatchEvent(new CustomEvent("eco-user",{detail:{u,rol}}));
  });
}catch(e){console.warn("Firebase no cargó:",e)}
