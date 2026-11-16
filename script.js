// PERSONALIZADOR 1H DEPORTES
// Comparte el carrito con la tienda usando la misma clave de localStorage.
const CART_KEY = "1hdeportes_cart";
const $ = (id) => document.getElementById(id);

let selectedColor = "#111111";
let selectedPattern = "none";
let selectedType = "Fútbol de Barrio";
let basePrice = 49900;
let players = [
  { name: "", number: "10", size: "M" },
  { name: "", number: "7", size: "L" }
];

const money = (value) => "$" + value.toLocaleString("es-CO") + " COP";

function renderPlayers() {
  $("players").innerHTML = "";
  players.forEach((player, index) => {
    const row = document.createElement("div");
    row.className = "player-row";
    row.innerHTML = `
      <input type="text" maxlength="20" placeholder="Ej: Juan Pérez" aria-label="Nombre del jugador ${index + 1}" value="${escapeHtml(player.name)}" data-field="name" data-index="${index}">
      <select aria-label="Número del jugador ${index + 1}" data-field="number" data-index="${index}">
        ${Array.from({length: 100}, (_, n) => `<option value="${n}" ${String(player.number) === String(n) ? "selected" : ""}>${n}</option>`).join("")}
      </select>
      <select aria-label="Talla del jugador ${index + 1}" data-field="size" data-index="${index}">
        ${["XS","S","M","L","XL","XXL"].map(size => `<option ${player.size === size ? "selected" : ""}>${size}</option>`).join("")}
      </select>
      <button type="button" class="remove-player" data-remove="${index}" aria-label="Eliminar jugador">▤</button>`;
    $("players").appendChild(row);
  });
  updatePrices();
  updatePreview();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  })[char]);
}

function updatePrices() {
  const surcharge = selectedPattern === "none" ? 0 : 3000;
  const unit = basePrice + surcharge;
  $("unitPrice").textContent = money(unit);
  $("totalPrice").textContent = money(unit * players.length);
}

function updatePreview() {
  $("shirtShape").setAttribute("fill", selectedColor);
  const pattern = $("shirtPattern");
  const patterns = {
    none: "none",
    diagonal: "url(#diagonal)",
    vertical: "url(#diagonal)",
    chevron: "url(#diagonal)",
    blocks: "url(#diagonal)",
    stars: "url(#diagonal)",
    half: "url(#diagonal)"
  };
  pattern.setAttribute("fill", patterns[selectedPattern] || "none");
  pattern.setAttribute("opacity", selectedPattern === "none" ? "0" : ".35");
  pattern.setAttribute("stroke", "#fff");
  pattern.setAttribute("stroke-width", "2");
  $("teamPrint").textContent = $("teamName").value.trim().toUpperCase() || "TU EQUIPO";
  $("numberPrint").textContent = players[0]?.number || "10";
  $("backNamePrint").textContent = (players[0]?.name || "JUGADOR").toUpperCase();
}

document.querySelectorAll(".swatch").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".swatch").forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
    selectedColor = button.dataset.color;
    updatePreview();
  });
});

document.querySelectorAll(".pattern").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".pattern").forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
    selectedPattern = button.dataset.pattern;
    updatePrices();
    updatePreview();
  });
});

document.querySelectorAll(".type").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".type").forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
    selectedType = button.dataset.type;
    basePrice = Number(button.dataset.price);
    updatePrices();
  });
});

$("teamName").addEventListener("input", updatePreview);

$("players").addEventListener("input", handlePlayerChange);
$("players").addEventListener("change", handlePlayerChange);

function handlePlayerChange(event) {
  const field = event.target.dataset.field;
  const index = Number(event.target.dataset.index);
  if (!field || !players[index]) return;
  players[index][field] = event.target.value;
  updatePrices();
  updatePreview();
}

$("players").addEventListener("click", event => {
  const removeIndex = event.target.dataset.remove;
  if (removeIndex === undefined) return;
  if (players.length === 1) {
    alert("Debes tener al menos un jugador.");
    return;
  }
  players.splice(Number(removeIndex), 1);
  renderPlayers();
});

$("addPlayer").addEventListener("click", () => {
  if (players.length >= 25) {
    alert("Puedes agregar máximo 25 jugadores por pedido.");
    return;
  }
  players.push({ name: "", number: String(players.length + 1), size: "M" });
  renderPlayers();
});

document.querySelectorAll(".thumb").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".thumb").forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
    const back = button.dataset.view === "back";
    $("teamPrint").style.opacity = back ? "0" : "1";
    $("brandPrint").style.opacity = back ? "0" : "1";
    $("numberPrint").style.opacity = back ? "0" : "1";
    $("backNamePrint").style.opacity = back ? "1" : "0";
  });
});

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + Number(item.qty || item.cantidad || 1), 0);
  $("cartCount").textContent = count;
}

$("addToCart").addEventListener("click", () => {
  if (players.some(player => !player.name.trim())) {
    alert("Escribe el nombre de todos los jugadores antes de agregar el pedido.");
    return;
  }

  const cart = getCart();
  const unit = basePrice + (selectedPattern === "none" ? 0 : 3000);

  players.forEach(player => {
    cart.push({
      id: Date.now() + Math.random(),
      name: `${selectedType} personalizado - ${player.name}`,
      price: unit,
      qty: 1,
      size: player.size,
      number: player.number,
      team: $("teamName").value.trim(),
      color: selectedColor,
      pattern: selectedPattern,
      type: selectedType
    });
  });

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2500);
});

$("cartButton").addEventListener("click", () => {
  const cart = getCart();
  if (!cart.length) {
    alert("Tu carrito está vacío.");
    return;
  }
  const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
  const lines = cart.map((item, i) =>
    `${i + 1}. ${item.name} | Talla: ${item.size || "-"} | #${item.number || "-"} | ${money(Number(item.price || 0))}`
  );
  alert("TU CARRITO 1H DEPORTES\n\n" + lines.join("\n") + "\n\nTOTAL: " + money(total));
});

window.addEventListener("storage", event => {
  if (event.key === CART_KEY) updateCartCount();
});

renderPlayers();
updateCartCount();
