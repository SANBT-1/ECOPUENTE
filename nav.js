// Construye la barra lateral y la barra superior en todas las páginas.
// Cada página solo necesita: <body data-activo="..."> y un <main class="principal">.
(function () {
  const L = [
    ["inicio", "index.html", "Inicio"],
    ["informacion", "informacion1.html", "Información"],
    ["naturaleza", "naturaleza.html", "Naturaleza"],
    ["bicicletas", "bicicletas.html", "Bicicletas"],
    ["habitos", "habitos.html", "Mis hábitos"],
    ["datos", "graficas.html", "Datos estadísticos"],
    ["mapa", "mapa.html", "Mapa"],
    ["donaciones", "donaciones.html", "Donaciones"]
  ];
  const act = document.body.dataset.activo;
  document.body.insertAdjacentHTML("afterbegin",
    `<aside class="side"><a class="marca" href="index.html"><i></i>EcoPuente</a>
    <nav>${L.map(([k, h, t]) => `<a href="${h}"${k === act ? ' class="activo"' : ""}>${t}</a>`).join("")}
    <a class="admin" id="linkAdmin" href="admin.html" hidden>Panel admin</a></nav>
    <div class="invitado" id="invitado">No has iniciado sesión</div>
    <div class="perfil" id="perfil" hidden><img id="foto" alt="Perfil">
      <div class="datos"><div id="pNombre"></div><span class="rol" id="pRol"></span></div>
      <button class="salir" id="salir" type="button">Salir</button></div></aside>`);
  document.querySelector(".principal").insertAdjacentHTML("afterbegin",
    `<div class="top"><button id="menuBtn" type="button" aria-label="Mostrar u ocultar menú">&#9776;</button>
    <a class="btn" id="btnSesion" href="inicia-sesion.html">Iniciar sesión</a></div>`);
  if (innerWidth < 900) document.body.classList.add("oculta");
  const $ = id => document.getElementById(id);
  $("menuBtn").onclick = () => document.body.classList.toggle("oculta");

  // Sesión (si auth.js no carga, el menú sigue funcionando)
  import("./auth.js").then(({ auth, onAuthStateChanged, obtenerRol, cerrarSesion }) => {
    $("salir").onclick = cerrarSesion;
    onAuthStateChanged(auth, async user => {
      const nombre = user && (user.displayName || user.email);
      const rol = user ? await obtenerRol(user) : "";
      $("btnSesion").hidden = $("invitado").hidden = !!user;
      $("perfil").hidden = !user;
      $("linkAdmin").hidden = rol !== "administrador";
      if ($("saludo")) $("saludo").textContent = user ? `¡Hola, ${nombre}!` : "";
      if (!user) return;
      $("pNombre").textContent = nombre;
      $("pRol").textContent = rol;
      $("pRol").className = "rol " + rol;
      $("foto").src = user.photoURL || "https://ui-avatars.com/api/?background=52B788&color=fff&name=" + encodeURIComponent(nombre);
    });
  }).catch(() => {});
})();
