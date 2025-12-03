const productos = [
  { 
    nombre: "Figura de dragón", 
    categoria: "figuras", 
    imagen: "assets/images/figura_dragon.png", 
    precio: "Bs. 80", 
    descripcion: "Figura de dragon decorativa impresa en 3D" 
  },
  { 
    nombre: "Figura pantera rosa", 
    categoria: "figuras", 
    imagen: "assets/images/figura_pinkpanter.png", 
    precio: "Bs. 60", 
    descripcion: "Figura de la pantera rosa" 
  },
  { 
    nombre: "Figura Simpsons", 
    categoria: "figuras", 
    imagen: "assets/images/figura_simpsons.png", 
    precio: "Bs. 100", 
    descripcion: "Figura de Homero ahorcando a Bart - Simpsons" 
  },
  { 
    nombre: "Llavero alien", 
    categoria: "llaveros", 
    imagen: "assets/images/llavero_alien.jpg", 
    precio: "Bs. 25", 
    descripcion: "Diseño cabeza de alien" 
  },
  { 
    nombre: "Llavero articulado", 
    categoria: "llaveros", 
    imagen: "assets/images/llavero_cocodrilo.png", 
    precio: "Bs. 60", 
    descripcion: "Diseño de llavero articulado" 
  },
  { 
    nombre: "Llaveros nombres", 
    categoria: "llaveros", 
    imagen: "assets/images/llavero_nombres.png", 
    precio: "Bs. 25", 
    descripcion: "llavero con nombres personalizados" 
  },
   { 
    nombre: "Llaveros amon-gus", 
    categoria: "llaveros", 
    imagen: "assets/images/llavero_amongus.png", 
    precio: "Bs. 30", 
    descripcion: "llavero among-us de diferentes colores" 
  },
   { 
    nombre: "Llaveros pareja", 
    categoria: "llaveros", 
    imagen: "assets/images/llavero_parejas.png", 
    precio: "Bs. 50", 
    descripcion: "llaveros para parejas" 
  },
   { 
    nombre: "Llavero capibara articulado", 
    categoria: "llaveros", 
    imagen: "assets/images/llavero_capibara.png", 
    precio: "Bs. 40", 
    descripcion: "llavero de capibara articulado" 
  },
  { 
    nombre: " Sistema solar", 
    categoria: "otros", 
    imagen: "assets/images/sistemasolar.png", 
    precio: "Bs. 40", 
    descripcion: "Sistema solar 3d" 
  },
  { 
    nombre: "Porta lapiceros", 
    categoria: "otros", 
    imagen: "assets/images/portalapicespatricio.png", 
    precio: "Bs. 60", 
    descripcion: "Porta lapiceros - Patricio" 
  },
  { 
    nombre: "Soporte celular", 
    categoria: "otros", 
    imagen: "assets/images/soportecelular.png", 
    precio: "Bs. 80", 
    descripcion: "Soporte celular - Robot" 
  }
];

function filtrar(categoria) {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  const filtrados = categoria === "todos"
    ? productos
    : productos.filter(p => p.categoria === categoria);

  filtrados.forEach(p => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" width="100%">
      <h3>${p.nombre}</h3>
      <p>${p.descripcion}</p>
      <p class="precio">${p.precio}</p>
      <button onclick="añadirAlCarrito('${p.nombre}')">Añadir al carrito</button>
      <button onclick="comprarAhora('${p.nombre}')">Comprar ahora</button>
    `;
    contenedor.appendChild(div);
  });
}


let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function actualizarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarContadorCarrito();
}

function mostrarContadorCarrito() {
  const contador = document.getElementById("contador-carrito");
  if (contador) {
    const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    contador.textContent = totalItems;
  }
}

function añadirAlCarrito(nombreProducto) {
  const producto = productos.find(p => p.nombre === nombreProducto);
  if (!producto) return;

  const existente = carrito.find(p => p.nombre === nombreProducto);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  actualizarCarrito();
  alert(`"${nombreProducto}" fue añadido al carrito.`);
}

function comprarAhora(nombreProducto) {
  const producto = productos.find(p => p.nombre === nombreProducto);
  if (!producto) return;

  const mensaje = encodeURIComponent(`Hola Kreo3D, quiero comprar ahora:\n- ${producto.nombre} (${producto.precio})`);
  window.open(`https://wa.me/59173867546?text=${mensaje}`, "_blank");
}

function verCarrito() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const resumen = carrito.map(p => `- ${p.nombre} x${p.cantidad} (${p.precio})`).join("\n");
  const mensaje = encodeURIComponent(`Hola Kreo3D, quiero comprar estos productos:\n${resumen}`);
  window.open(`https://wa.me/59173867546?text=${mensaje}`, "_blank");
}

window.addEventListener("DOMContentLoaded", () => {
  filtrar("todos");
  mostrarContadorCarrito();
});

window.addEventListener("DOMContentLoaded", () => {
  filtrar("todos");
});

document.getElementById("form-personalizar").addEventListener("submit", function(e) {
  e.preventDefault();
  const mensaje = document.getElementById("mensaje-form");
  mensaje.textContent = "¡Tu solicitud fue enviada con éxito! Te contactaremos pronto por correo o WhatsApp.";
  mensaje.style.color = "green";
});

const form = document.getElementById("form-personalizar");
const loader = document.getElementById("loader");
const previewImg = document.getElementById("preview-img");
const previewInfo = document.getElementById("preview-info");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("imagen");
  const file = fileInput.files[0];
  if (!file) return alert("Sube una imagen.");
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
    return alert("Formato no permitido. Usa JPG, PNG o WEBP.");
  }
  if (file.size > 8 * 1024 * 1024) {
    return alert("Archivo muy grande. Máximo 8 MB.");
  }

  loader.style.display = "block";
  previewImg.style.display = "none";
  previewInfo.textContent = "";

  const formData = new FormData();
  formData.append("tipo", document.getElementById("tipo").value);
  formData.append("altura", document.getElementById("altura").value);
  formData.append("comentarios", document.getElementById("comentarios").value);
  formData.append("imagen", file);

  try {
    const resp = await fetch("http://localhost:3000/api/preview", {
      method: "POST",
      body: formData
    });
    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      throw new Error(data.detail || "Error generando previsualización");
    }

    previewImg.src = data.image;
    previewImg.style.display = "block";
    previewInfo.textContent = `Tipo: ${data.meta.tipo}, Altura: ${data.meta.altura} cm. ${data.meta.comentarios ? "Detalles: " + data.meta.comentarios : ""}`;
  } catch (err) {
    alert("Hubo un problema al generar la previsualización. " + err.message);
  } finally {
    loader.style.display = "none";
  }
});

function abrirCarrito() {
  document.getElementById("carrito-panel").classList.add("abierto");
  renderCarrito();
}

function cerrarCarrito() {
  document.getElementById("carrito-panel").classList.remove("abierto");
}

function renderCarrito() {
  const contenedor = document.getElementById("carrito-items");
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    document.getElementById("carrito-total").textContent = "Total: Bs 0";
    return;
  }

  let total = 0;
  carrito.forEach(p => {
    total += parseFloat(p.precio.replace("Bs. ", "")) * p.cantidad;
    const div = document.createElement("div");
    div.className = "carrito-item";
    div.innerHTML = `
      <span>${p.nombre} x${p.cantidad}</span>
      <button onclick="eliminarDelCarrito('${p.nombre}')">🗑️</button>
    `;
    contenedor.appendChild(div);
  });

  document.getElementById("carrito-total").textContent = `Total: Bs ${total}`;
}

function eliminarDelCarrito(nombreProducto) {
  carrito = carrito.filter(p => p.nombre !== nombreProducto);
  actualizarCarrito();
  renderCarrito();
}

function enviarCarrito() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const resumen = carrito.map(p => `- ${p.nombre} x${p.cantidad} (${p.precio})`).join("\n");
  const total = carrito.reduce((acc, p) => acc + parseFloat(p.precio.replace("Bs. ", "")) * p.cantidad, 0);
  const mensaje = encodeURIComponent(`Hola Kreo3D, quiero cotizar estos productos:\n${resumen}\nTotal: Bs ${total}`);
  window.open(`https://wa.me/59173867546?text=${mensaje}`, "_blank");
}

function toggleMenu() {
  const menu = document.getElementById("menu");
  menu.classList.toggle("abierto");
}

function cerrarMenu() {
  const menu = document.getElementById("menu");
  menu.classList.remove("abierto");
}
