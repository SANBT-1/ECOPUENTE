// Construye la barra lateral y la barra superior en todas las páginas.
// Cada página solo necesita: <body data-activo="..."> y un <main class="principal">.
(function () {
  const L = [
    ["inicio", "index.html", "Inicio"],
    ["informacion", "informacion1.html", "Información"],
    ["bicicletas", "bicicletas.html", "Bicicletas"],
    ["habitos", "habitos.html", "Mis hábitos"],
    ["datos", "graficas.html", "Datos estadísticos"],
    ["mapa", "mapa.html", "Mapa"],
    ["equipo", "equipo.html", "Equipo"],
    ["donaciones", "donaciones.html", "Donaciones"]
  ];
  const act = document.body.dataset.activo;
  document.body.insertAdjacentHTML("afterbegin",
    `<aside class="side"><a class="marca" href="index.html">EcoPuente</a>
    <nav>${L.map(([k, h, t]) => `<a href="${h}"${k === act ? ' class="activo"' : ""}>${t}</a>`).join("")}
    <a class="admin" id="linkAdmin" href="admin.html" hidden>Panel admin</a></nav>
    <div class="invitado" id="invitado">No has iniciado sesión</div>
    <div class="perfil" id="perfil" hidden><img id="foto" alt="Perfil">
      <div class="datos"><div id="pNombre"></div><span class="rol" id="pRol"></span></div>
      <button class="salir" id="salir" type="button">Salir</button></div></aside>`);
  document.querySelector(".principal").insertAdjacentHTML("afterbegin",
    `<div class="top"><button id="menuBtn" type="button" aria-label="Mostrar u ocultar menú">&#9776;</button>
    <a class="btn" id="btnSesion" href="inicia-sesion.html">Iniciar sesión</a></div>`);
  document.body.classList.add("oculta"); // el menú arranca cerrado
  const $ = id => document.getElementById(id);
  $("menuBtn").onclick = () => document.body.classList.toggle("oculta");

  // Sesión (si auth.js no carga, el menú sigue funcionando)
  import("./auth.js").then(({ auth, db, onAuthStateChanged, obtenerRol, cerrarSesion }) => {
    $("salir").onclick = cerrarSesion;
    onAuthStateChanged(auth, async user => {
      const nombre = user && (user.displayName || user.email);
      const rol = user ? await obtenerRol(user) : "";
      $("btnSesion").hidden = $("invitado").hidden = !!user;
      $("perfil").hidden = !user;
      $("linkAdmin").hidden = rol !== "administrador";
      if (rol === "administrador" && !sessionStorage.getItem("eqSync")) sincronizarEquipo(db);
      if ($("saludo")) $("saludo").textContent = user ? `¡Hola, ${nombre}!` : "";
      if (!user) return;
      $("pNombre").textContent = nombre;
      $("pRol").textContent = rol;
      $("pRol").className = "rol " + rol;
      $("foto").src = user.photoURL || "https://ui-avatars.com/api/?background=52B788&color=fff&name=" + encodeURIComponent(nombre);
    });
  }).catch(() => {});

  // Cuando un administrador entra a cualquier página, se asegura de que todos los administradores tengan su tarjeta en "Equipo"
  async function sincronizarEquipo(db) {
    try {
      const f = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
      const admins = (await f.getDocs(f.collection(db, "usuarios"))).docs.filter(d => d.data().rol === "administrador");
      const tarjetas = new Set((await f.getDocs(f.collection(db, "equipo"))).docs.map(d => d.id));
      const ids = new Set(admins.map(d => d.id));
      for (const d of admins) if (!tarjetas.has(d.id))
        await f.setDoc(f.doc(db, "equipo", d.id), { nombre: d.data().nombre || d.data().email || "Administrador", cargo: "Administrador", bio: "", foto: "" });
      if (admins.length) for (const id of tarjetas) if (!ids.has(id)) await f.deleteDoc(f.doc(db, "equipo", id));
      sessionStorage.setItem("eqSync", "1");
    } catch (e) { console.warn("equipo:", e.code); }
  }
})();
