const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "wireframes", "dulce-momento-wireframes.pdf");
const LOGO = path.join(__dirname, "..", "wireframes", "assets", "logo-dulce-momento.png");
fs.mkdirSync(path.dirname(OUT), { recursive: true });

// Desktop long-scroll canvas
const W = 1440;
const H = 1680;

const C = {
  burgundy: "#561C24",
  rose: "#6D2932",
  taupe: "#C7B7A3",
  cream: "#E8D8C4",
  blush: "#F7EEE4",
  pink: "#E98CA1",
  gold: "#C19A6B",
  white: "#FFFFFF",
  ink: "#3A1F22",
  muted: "#7A5C55",
  line: "#D4C4B0",
};

const doc = new PDFDocument({
  size: [W, H],
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  info: {
    Title: "Dulce Momento — Wireframes Desktop (Inicio, Contáctanos, Sobre nosotros)",
    Author: "Dulce Momento",
  },
});

const stream = fs.createWriteStream(OUT);
doc.pipe(stream);

function fill(color) {
  doc.rect(0, 0, W, H).fill(color);
}

function rect(x, y, w, h, opts = {}) {
  doc.save();
  if (opts.fill) {
    doc.roundedRect(x, y, w, h, opts.r || 0).fill(opts.fill);
  }
  if (opts.stroke) {
    doc
      .lineWidth(opts.lw || 1.25)
      .strokeColor(opts.stroke)
      .roundedRect(x, y, w, h, opts.r || 0)
      .stroke();
  }
  doc.restore();
}

function text(str, x, y, opts = {}) {
  doc
    .font(opts.bold ? "Times-Bold" : opts.serif ? "Times-Roman" : "Helvetica")
    .fontSize(opts.size || 12)
    .fillColor(opts.color || C.ink)
    .text(str, x, y, {
      width: opts.width,
      align: opts.align || "left",
      lineBreak: opts.lineBreak !== false,
    });
}

function centerText(str, x, y, w, opts = {}) {
  text(str, x, y, { ...opts, width: w, align: "center" });
}

function xImage(x, y, w, h, r = 12) {
  rect(x, y, w, h, { fill: C.taupe, r });
  doc.save();
  doc.strokeColor(C.rose).lineWidth(1).opacity(0.35);
  doc.moveTo(x + 8, y + 8).lineTo(x + w - 8, y + h - 8).stroke();
  doc.moveTo(x + w - 8, y + 8).lineTo(x + 8, y + h - 8).stroke();
  doc.restore();
  centerText("IMG", x, y + h / 2 - 8, w, { size: 11, color: C.rose, bold: true });
}

function circleImage(cx, cy, r) {
  doc.save();
  doc.circle(cx, cy, r).fill(C.taupe);
  doc.circle(cx, cy, r).lineWidth(1.5).strokeColor(C.rose).stroke();
  doc.restore();
  centerText("IMG", cx - r, cy - 8, r * 2, { size: 11, color: C.rose, bold: true });
}

function heartDivider(cx, y) {
  const half = 180;
  doc.save();
  doc.strokeColor(C.gold).lineWidth(1.25);
  doc.moveTo(cx - half, y).lineTo(cx - 14, y).stroke();
  doc.moveTo(cx + 14, y).lineTo(cx + half, y).stroke();
  doc.restore();
  centerText("♥", cx - 10, y - 8, 20, { size: 12, color: C.gold });
}

function pageChrome(title, activeNav) {
  // top annotation bar
  doc.rect(0, 0, W, 30).fill(C.burgundy);
  text(
    `WIREFRAME · Dulce Momento · Desktop 1440px · ${title} · Paleta: #561C24 · #6D2932 · #C7B7A3 · #E8D8C4`,
    28,
    9,
    { size: 10, color: C.cream, bold: false }
  );

  // header
  const hy = 30;
  doc.rect(0, hy, W, 78).fill(C.blush);
  doc.moveTo(0, hy + 78).lineTo(W, hy + 78).strokeColor(C.line).lineWidth(1).stroke();

  if (fs.existsSync(LOGO)) {
    try {
      doc.image(LOGO, 36, hy + 8, { height: 62 });
    } catch (_) {
      text("Dulce Momento", 36, hy + 28, { size: 18, serif: true, bold: true, color: C.burgundy });
    }
  } else {
    text("Dulce Momento", 36, hy + 28, { size: 18, serif: true, bold: true, color: C.burgundy });
  }

  const nav = ["Inicio", "Menú", "Sobre nosotros", "Contáctanos"];
  let nx = 420;
  nav.forEach((item) => {
    const active = item === activeNav;
    text(item, nx, hy + 32, {
      size: 13,
      color: active ? C.burgundy : C.muted,
      bold: active,
    });
    if (active) {
      const tw = doc.widthOfString(item);
      doc
        .moveTo(nx, hy + 52)
        .lineTo(nx + tw, hy + 52)
        .strokeColor(C.pink)
        .lineWidth(2)
        .stroke();
    }
    nx += doc.widthOfString(item) + 36;
  });

  rect(W - 210, hy + 22, 100, 36, { fill: C.burgundy, r: 18 });
  centerText("Pedir ahora", W - 210, hy + 32, 100, { size: 11, color: C.cream, bold: true });
  rect(W - 96, hy + 22, 56, 36, { fill: C.white, stroke: C.taupe, r: 18 });
  centerText("🛒", W - 96, hy + 30, 56, { size: 14, color: C.burgundy });
}

function footer(y) {
  doc.rect(0, y, W, H - y).fill(C.burgundy);
  text("Dulce Momento", 60, y + 36, { size: 20, serif: true, bold: true, color: C.cream });
  text("momentos memorables con dulzura", 60, y + 64, { size: 11, color: C.gold });
  text("Horario · Lun–Sáb 8:00–20:00", 60, y + 100, { size: 11, color: C.taupe });
  text("Calle Ejemplo 123 · Ciudad", 60, y + 118, { size: 11, color: C.taupe });

  text("Explorar", 520, y + 36, { size: 12, color: C.gold, bold: true });
  ["Inicio", "Menú", "Sobre nosotros", "Contáctanos"].forEach((l, i) => {
    text(l, 520, y + 62 + i * 22, { size: 11, color: C.cream });
  });

  text("Síguenos", 860, y + 36, { size: 12, color: C.gold, bold: true });
  ["Instagram", "Facebook", "WhatsApp"].forEach((l, i) => {
    rect(860 + i * 110, y + 64, 96, 32, { fill: C.rose, r: 16 });
    centerText(l, 860 + i * 110, y + 73, 96, { size: 10, color: C.cream });
  });

  text("© Dulce Momento · Wireframe de referencia", 60, y + 170, {
    size: 10,
    color: C.taupe,
  });
}

function note(str, x, y) {
  text(str, x, y, { size: 9, color: C.gold });
}

// ===================== PAGE 1: INICIO =====================
fill(C.cream);
pageChrome("Página 1/3 — Inicio", "Inicio");

// Hero
const heroY = 128;
doc.rect(0, heroY, W, 420).fill(C.blush);
text("Momentos memorables", 72, heroY + 90, {
  size: 42,
  serif: true,
  bold: true,
  color: C.burgundy,
  width: 520,
});
text("con dulzura", 72, heroY + 140, {
  size: 42,
  serif: true,
  bold: true,
  color: C.pink,
  width: 520,
});
text(
  "Pastelería artesanal · tortas personalizadas · café y dulces para celebrar lo importante.",
  72,
  heroY + 210,
  { size: 14, color: C.muted, width: 460 }
);
rect(72, heroY + 280, 170, 48, { fill: C.burgundy, r: 24 });
centerText("Ver menú", 72, heroY + 295, 170, { size: 13, color: C.cream, bold: true });
rect(260, heroY + 280, 180, 48, { fill: C.white, stroke: C.burgundy, r: 24, lw: 1.5 });
centerText("Hacer pedido", 260, heroY + 295, 180, { size: 13, color: C.burgundy, bold: true });

circleImage(1080, heroY + 210, 160);
note("1. Hero: tipografía serif + imagen circular + CTAs marca", 72, heroY + 390);

heartDivider(W / 2, heroY + 440);

// Categories
const catY = heroY + 470;
text("Nuestras especialidades", 72, catY, { size: 26, serif: true, bold: true, color: C.burgundy });
centerText("categorías destacadas", 72, catY + 34, 400, {
  size: 12,
  color: C.gold,
  align: "left",
});

const cats = [
  { t: "Tortas", bg: C.taupe },
  { t: "Cupcakes", bg: "#E8C9CF" },
  { t: "Panadería", bg: C.cream },
  { t: "Bebidas", bg: "#D9CBB8" },
];
cats.forEach((c, i) => {
  const x = 72 + i * 330;
  rect(x, catY + 70, 300, 200, { fill: c.bg, r: 20 });
  xImage(x + 40, catY + 90, 220, 110, 14);
  centerText(c.t, x, catY + 215, 300, { size: 16, serif: true, bold: true, color: C.burgundy });
});
note("2. Grid de categorías con fondos de paleta", 72, catY + 285);

// Values strip
const valY = catY + 320;
doc.rect(0, valY, W, 110).fill(C.taupe);
const vals = [
  ["Ingredientes frescos", "Selección diaria"],
  ["Hecho a mano", "Recetas de casa"],
  ["Pedidos especiales", "Personalizamos"],
  ["Entrega", "En tu momento"],
];
vals.forEach((v, i) => {
  const x = 90 + i * 340;
  text(v[0], x, valY + 34, { size: 14, bold: true, color: C.burgundy });
  text(v[1], x, valY + 58, { size: 12, color: C.rose });
});
note("3. Barra de valor / confianza", 72, valY + 92);

// Featured products
const prodY = valY + 140;
text("Favoritos de la semana", 72, prodY, { size: 26, serif: true, bold: true, color: C.burgundy });
const products = ["Rose Cake", "Macarons", "Croissant", "Latte"];
products.forEach((p, i) => {
  const x = 72 + i * 330;
  rect(x, prodY + 50, 300, 260, { fill: C.white, stroke: C.line, r: 18 });
  xImage(x + 20, prodY + 70, 260, 140, 12);
  text(p, x + 24, prodY + 226, { size: 15, serif: true, bold: true, color: C.burgundy });
  text("$00.00", x + 24, prodY + 250, { size: 12, color: C.muted });
  rect(x + 170, prodY + 242, 100, 32, { fill: C.rose, r: 16 });
  centerText("Añadir", x + 170, prodY + 251, 100, { size: 11, color: C.cream, bold: true });
});
note("4. Productos destacados", 72, prodY + 325);

footer(prodY + 360);

// ===================== PAGE 2: CONTACTANOS =====================
doc.addPage({ size: [W, H], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
fill(C.cream);
pageChrome("Página 2/3 — Contáctanos", "Contáctanos");

// Page hero banner
const chY = 128;
doc.rect(0, chY, W, 180).fill(C.burgundy);
xImage(0, chY, W, 180, 0);
doc.rect(0, chY, W, 180).fillOpacity(0.55).fill(C.burgundy);
doc.fillOpacity(1);
centerText("Contáctanos", 0, chY + 70, W, { size: 44, serif: true, bold: true, color: C.cream });
centerText("Estamos para endulzar tu momento", 0, chY + 125, W, { size: 14, color: C.gold });
note("1. Hero de página con foto + overlay burdeos", 72, chY + 160);

heartDivider(W / 2, chY + 210);

// Two columns: details + form
const bodyY = chY + 250;
text("Datos de contacto", 72, bodyY, { size: 24, serif: true, bold: true, color: C.burgundy });
text(
  "Escríbenos para pedidos especiales, cotizaciones de tortas o reservas para eventos.",
  72,
  bodyY + 40,
  { size: 13, color: C.muted, width: 420 }
);

const details = [
  ["📍 Dirección", "Calle Ejemplo 123, Ciudad"],
  ["✉ Email", "hola@dulcemomento.com"],
  ["☎ Teléfono", "+00 000 000 0000"],
  ["🕒 Horario", "Lun–Sáb 8:00–20:00"],
];
details.forEach((d, i) => {
  const y = bodyY + 110 + i * 70;
  rect(72, y, 420, 58, { fill: C.blush, r: 14 });
  text(d[0], 92, y + 12, { size: 12, color: C.gold, bold: true });
  text(d[1], 92, y + 32, { size: 13, color: C.burgundy });
});

text("Redes", 72, bodyY + 400, { size: 13, color: C.gold, bold: true });
["IG", "FB", "WA"].forEach((s, i) => {
  doc.circle(100 + i * 56, bodyY + 450, 20).fill(C.rose);
  centerText(s, 80 + i * 56, bodyY + 443, 40, { size: 10, color: C.cream, bold: true });
});
note("2. Columna de contacto + redes", 72, bodyY + 490);

// Form
rect(560, bodyY, 800, 520, { fill: C.white, stroke: C.line, r: 20 });
text("Envíanos un mensaje", 600, bodyY + 28, {
  size: 22,
  serif: true,
  bold: true,
  color: C.burgundy,
});

const fields = [
  ["Nombre", 600, bodyY + 80, 340],
  ["Email", 960, bodyY + 80, 340],
  ["Teléfono", 600, bodyY + 170, 340],
  ["Asunto", 960, bodyY + 170, 340],
];
fields.forEach(([label, x, y, w]) => {
  text(label, x, y, { size: 11, color: C.muted });
  rect(x, y + 20, w, 44, { fill: C.blush, stroke: C.taupe, r: 10 });
});
text("Mensaje", 600, bodyY + 260, { size: 11, color: C.muted });
rect(600, bodyY + 280, 700, 130, { fill: C.blush, stroke: C.taupe, r: 10 });
rect(600, bodyY + 440, 200, 48, { fill: C.burgundy, r: 24 });
centerText("Enviar mensaje", 600, bodyY + 455, 200, { size: 13, color: C.cream, bold: true });
note("3. Formulario · botón primario burdeos", 600, bodyY + 500);

// Map
const mapY = bodyY + 560;
text("Encuéntranos", 72, mapY, { size: 22, serif: true, bold: true, color: C.burgundy });
rect(72, mapY + 40, W - 144, 220, { fill: C.taupe, r: 16 });
centerText("MAPA · ubicación de la pastelería", 72, mapY + 135, W - 144, {
  size: 14,
  color: C.rose,
  bold: true,
});
doc.circle(W / 2, mapY + 150, 10).fill(C.burgundy);
note("4. Mapa a ancho completo", 72, mapY + 275);

footer(mapY + 310);

// ===================== PAGE 3: SOBRE NOSOTROS =====================
doc.addPage({ size: [W, H], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
fill(C.cream);
pageChrome("Página 3/3 — Sobre nosotros", "Sobre nosotros");

const ahY = 128;
doc.rect(0, ahY, W, 160).fill(C.blush);
centerText("Sobre nosotros", 0, ahY + 55, W, {
  size: 44,
  serif: true,
  bold: true,
  color: C.burgundy,
});
centerText("La historia detrás de cada dulce momento", 0, ahY + 110, W, {
  size: 14,
  color: C.gold,
});
heartDivider(W / 2, ahY + 150);

// Story zigzag
const storyY = ahY + 190;
circleImage(280, storyY + 150, 140);
text("Nuestra historia", 520, storyY + 40, {
  size: 28,
  serif: true,
  bold: true,
  color: C.burgundy,
  width: 700,
});
text(
  "Dulce Momento nació del amor por la pastelería artesanal y las celebraciones íntimas. Creamos tortas, postres y panadería fina para convertir lo cotidiano en algo memorable.",
  520,
  storyY + 90,
  { size: 14, color: C.muted, width: 700 }
);
text(
  "Cada receta combina técnica, ingredientes seleccionados y un toque floral que refleja nuestra identidad: elegante, cálida y dulce.",
  520,
  storyY + 170,
  { size: 14, color: C.muted, width: 700 }
);
rect(520, storyY + 240, 160, 44, { fill: C.rose, r: 22 });
centerText("Ver menú", 520, storyY + 253, 160, { size: 12, color: C.cream, bold: true });
note("1. Historia · layout imagen circular + texto (estilo boutique)", 72, storyY + 310);

// Mission / values
const misY = storyY + 350;
doc.rect(0, misY, W, 280).fill(C.taupe);
text("Lo que nos mueve", 72, misY + 36, { size: 26, serif: true, bold: true, color: C.burgundy });
const pillars = [
  ["Calidez", "Atención cercana en cada pedido"],
  ["Oficio", "Hecho a mano, día a día"],
  ["Detalle", "Presentación que enamora"],
];
pillars.forEach((p, i) => {
  const x = 72 + i * 440;
  rect(x, misY + 90, 400, 140, { fill: C.cream, r: 18 });
  centerText("♥", x, misY + 110, 400, { size: 18, color: C.gold });
  centerText(p[0], x, misY + 145, 400, { size: 18, serif: true, bold: true, color: C.burgundy });
  centerText(p[1], x, misY + 180, 400, { size: 12, color: C.muted });
});
note("2. Pilares de marca con acento dorado del logo", 72, misY + 250);

// Team / process
const teamY = misY + 320;
text("Nuestro equipo", 72, teamY, { size: 26, serif: true, bold: true, color: C.burgundy });
["Chef pastelera", "Barista", "Atención"].forEach((role, i) => {
  const x = 120 + i * 420;
  circleImage(x + 100, teamY + 130, 90);
  centerText(role, x, teamY + 240, 200, { size: 14, serif: true, bold: true, color: C.burgundy });
  centerText("Nombre", x, teamY + 262, 200, { size: 12, color: C.muted });
});
note("3. Equipo · fotos circulares", 72, teamY + 300);

// CTA band
const ctaY = teamY + 340;
doc.rect(72, ctaY, W - 144, 120, { fill: C.burgundy, r: 20 });
text("¿Listo para tu próximo dulce momento?", 110, ctaY + 34, {
  size: 24,
  serif: true,
  bold: true,
  color: C.cream,
  width: 700,
});
text("Contáctanos para cotizar tortas y pedidos especiales.", 110, ctaY + 72, {
  size: 13,
  color: C.gold,
  width: 700,
});
rect(W - 320, ctaY + 36, 180, 48, { fill: C.pink, r: 24 });
centerText("Contáctanos", W - 320, ctaY + 51, 180, { size: 13, color: C.burgundy, bold: true });
note("4. CTA final hacia Contáctanos", 72, ctaY + 130);

footer(ctaY + 160);

doc.end();

stream.on("finish", () => {
  console.log("PDF creado:", OUT);
});
