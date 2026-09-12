const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "wireframes", "menu-inicio-desktop.pdf");
fs.mkdirSync(path.dirname(OUT), { recursive: true });

// Desktop canvas ~1440x900 mapped to landscape page
const W = 1440;
const H = 900;
const MARGIN = 40;

const doc = new PDFDocument({
  size: [W, H],
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  info: {
    Title: "Wireframe — Menú de inicio (Desktop)",
    Author: "Bakery",
  },
});

const stream = fs.createWriteStream(OUT);
doc.pipe(stream);

const stroke = "#333333";
const muted = "#666666";
const light = "#B0B0B0";
const fillLight = "#F5F5F5";
const fillBox = "#E8E8E8";

function box(x, y, w, h, opts = {}) {
  doc.save();
  if (opts.fill) doc.rect(x, y, w, h).fill(opts.fill);
  doc.lineWidth(opts.lw || 1.5).strokeColor(opts.stroke || stroke);
  doc.rect(x, y, w, h).stroke();
  doc.restore();
}

function dashedBox(x, y, w, h) {
  doc.save();
  doc.lineWidth(1.25).strokeColor(light).dash(6, { space: 4 });
  doc.rect(x, y, w, h).stroke();
  doc.undash();
  doc.restore();
}

function label(text, x, y, opts = {}) {
  doc
    .font("Helvetica")
    .fontSize(opts.size || 11)
    .fillColor(opts.color || muted)
    .text(text, x, y, {
      width: opts.width,
      align: opts.align || "left",
      lineBreak: false,
    });
}

function centerLabel(text, x, y, w, h, size = 12) {
  doc.font("Helvetica").fontSize(size).fillColor(muted);
  const tw = doc.widthOfString(text);
  const th = doc.currentLineHeight();
  doc.text(text, x + (w - tw) / 2, y + (h - th) / 2, { lineBreak: false });
}

function xPlaceholder(x, y, w, h) {
  dashedBox(x, y, w, h);
  doc.save();
  doc.strokeColor(light).lineWidth(1);
  doc.moveTo(x, y).lineTo(x + w, y + h).stroke();
  doc.moveTo(x + w, y).lineTo(x, y + h).stroke();
  doc.restore();
}

// Page background
doc.rect(0, 0, W, H).fill("#FFFFFF");

// Title strip (outside UI)
doc.rect(0, 0, W, 28).fill("#222222");
doc
  .font("Helvetica-Bold")
  .fontSize(11)
  .fillColor("#FFFFFF")
  .text("WIREFRAME · Baja fidelidad · Desktop 1440×900 · Página: Menú de inicio · Bakery", MARGIN, 8, {
    lineBreak: false,
  });

const uiY = 36;
const uiH = H - uiY - 24;
const uiX = MARGIN;
const uiW = W - MARGIN * 2;

// Outer browser/frame
box(uiX, uiY, uiW, uiH, { fill: "#FFFFFF" });

// --- HEADER ---
const headerH = 64;
box(uiX, uiY, uiW, headerH, { fill: fillLight });
label("[LOGO]", uiX + 24, uiY + 24, { size: 14, color: stroke });
doc.font("Helvetica-Bold").fontSize(14).fillColor(stroke).text("[LOGO]", uiX + 24, uiY + 22, { lineBreak: false });

const navItems = ["Inicio", "Menú", "Pedidos", "Nosotros", "Contacto"];
let navX = uiX + 180;
navItems.forEach((item, i) => {
  const active = item === "Menú";
  doc
    .font(active ? "Helvetica-Bold" : "Helvetica")
    .fontSize(12)
    .fillColor(stroke)
    .text(item, navX, uiY + 24, { lineBreak: false });
  if (active) {
    const tw = doc.widthOfString(item);
    doc
      .moveTo(navX, uiY + 42)
      .lineTo(navX + tw, uiY + 42)
      .strokeColor(stroke)
      .lineWidth(2)
      .stroke();
  }
  navX += doc.widthOfString(item) + 36;
});

box(uiX + uiW - 160, uiY + 16, 56, 32, { fill: "#FFFFFF" });
centerLabel("Buscar", uiX + uiW - 160, uiY + 16, 56, 32, 10);
box(uiX + uiW - 90, uiY + 16, 66, 32, { fill: "#FFFFFF" });
centerLabel("Carrito (0)", uiX + uiW - 90, uiY + 16, 66, 32, 10);

// Annotation
label("1. Header: logo + nav + buscar + carrito", uiX + uiW - 280, uiY + headerH + 6, {
  size: 9,
  color: "#888888",
  width: 270,
});

// --- HERO ---
const heroY = uiY + headerH;
const heroH = 180;
box(uiX, heroY, uiW, heroH, { fill: fillBox });
xPlaceholder(uiX + 24, heroY + 20, 420, 140);
doc
  .font("Helvetica-Bold")
  .fontSize(22)
  .fillColor(stroke)
  .text("Título / Headline", uiX + 480, heroY + 48, { lineBreak: false });
doc
  .font("Helvetica")
  .fontSize(13)
  .fillColor(muted)
  .text("Subtítulo corto · descripción del menú del día", uiX + 480, heroY + 82, {
    width: 520,
  });
box(uiX + 480, heroY + 118, 140, 36, { fill: "#FFFFFF" });
centerLabel("CTA: Ver menú", uiX + 480, heroY + 118, 140, 36, 11);
label("2. Hero: imagen + título + CTA", uiX + uiW - 220, heroY + heroH - 18, {
  size: 9,
  color: "#888888",
});

// --- CATEGORIES ---
const catY = heroY + heroH + 16;
const catH = 44;
label("Categorías", uiX + 24, catY, { size: 11, color: stroke });
const cats = ["Todos", "Panadería", "Pastelería", "Bebidas", "Especiales"];
let catX = uiX + 24;
cats.forEach((c, i) => {
  const w = 100;
  box(catX, catY + 18, w, 28, { fill: i === 0 ? fillBox : "#FFFFFF" });
  centerLabel(c, catX, catY + 18, w, 28, 10);
  catX += w + 12;
});
label("3. Filtros de categoría", uiX + uiW - 160, catY + 28, { size: 9, color: "#888888" });

// --- PRODUCT GRID ---
const gridY = catY + catH + 28;
const cols = 4;
const rows = 2;
const gap = 20;
const cardW = (uiW - 48 - gap * (cols - 1)) / cols;
const cardH = 210;
const startX = uiX + 24;

doc.font("Helvetica-Bold").fontSize(14).fillColor(stroke).text("Productos del menú", startX, gridY, {
  lineBreak: false,
});

const products = [
  "Croissant",
  "Baguette",
  "Tarta de queso",
  "Café latte",
  "Pan de masa madre",
  "Macaron",
  "Brownie",
  "Jugo natural",
];

for (let i = 0; i < cols * rows; i++) {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = startX + col * (cardW + gap);
  const y = gridY + 28 + row * (cardH + gap);

  box(x, y, cardW, cardH, { fill: "#FFFFFF" });
  xPlaceholder(x + 12, y + 12, cardW - 24, 100);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(stroke)
    .text(products[i], x + 12, y + 124, { width: cardW - 24, lineBreak: false });
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor(muted)
    .text("$00.00", x + 12, y + 144, { lineBreak: false });
  box(x + 12, y + cardH - 44, cardW - 24, 28, { fill: fillLight });
  centerLabel("Añadir", x + 12, y + cardH - 44, cardW - 24, 28, 10);
}

label("4. Grid de productos (imagen · nombre · precio · CTA)", startX, gridY + 28 + 2 * (cardH + gap) - 8, {
  size: 9,
  color: "#888888",
});

// --- FOOTER ---
const footerH = 56;
const footerY = uiY + uiH - footerH;
box(uiX, footerY, uiW, footerH, { fill: fillLight });
centerLabel("Footer · Horario · Dirección · Redes · Legal", uiX, footerY, uiW, footerH, 11);
label("5. Footer", uiX + 24, footerY + footerH - 18, { size: 9, color: "#888888" });

// Page note
doc
  .font("Helvetica")
  .fontSize(9)
  .fillColor("#999999")
  .text(
    "Notas: sin estilos finales · cajas = contenedores · X = placeholder de imagen · texto = labels de contenido",
    MARGIN,
    H - 18,
    { lineBreak: false }
  );

doc.end();

stream.on("finish", () => {
  console.log("PDF creado:", OUT);
});
