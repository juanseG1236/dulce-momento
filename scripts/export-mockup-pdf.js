const puppeteer = require("puppeteer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "mockups");
const OUT = path.join(__dirname, "..", "wireframes", "dulce-momento-mockup.pdf");
const WIDTH = 1440;

const pages = [
  { file: "index.html", title: "Inicio" },
  { file: "contacto.html", title: "Contáctanos" },
  { file: "sobre-nosotros.html", title: "Sobre nosotros" },
];

async function capture(page, file) {
  const url = "file:///" + path.join(ROOT, file).replace(/\\/g, "/");
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  // wait fonts/images
  await new Promise((r) => setTimeout(r, 1200));
  const height = await page.evaluate(() => {
    const footer = document.querySelector("footer");
    const bottom = footer
      ? footer.getBoundingClientRect().bottom + window.scrollY
      : Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    return Math.ceil(bottom + 8);
  });
  await page.setViewport({ width: WIDTH, height: Math.max(height, 800), deviceScaleFactor: 1 });
  await new Promise((r) => setTimeout(r, 300));
  const buf = await page.screenshot({
    type: "png",
    clip: { x: 0, y: 0, width: WIDTH, height },
    captureBeyondViewport: true,
  });
  return { buf, height };
}

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  console.log("Lanzando navegador...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--allow-file-access-from-files"],
  });
  const page = await browser.newPage();
  // Allow local file images
  await page.setBypassCSP(true);

  const shots = [];
  for (const p of pages) {
    console.log("Capturando:", p.title);
    const shot = await capture(page, p.file);
    shots.push({ ...p, ...shot });
  }
  await browser.close();

  console.log("Generando PDF...");
  const doc = new PDFDocument({ autoFirstPage: false, info: { Title: "Dulce Momento — Mockup cute anime" } });
  const stream = fs.createWriteStream(OUT);
  doc.pipe(stream);

  for (const s of shots) {
    // Fit each mockup on one tall PDF page
    const pageH = Math.max(900, Math.round((s.height / WIDTH) * WIDTH));
    // pdfkit uses points; keep 1440 x proportional
    const pdfW = WIDTH;
    const pdfH = Math.round((s.height / WIDTH) * pdfW);
    doc.addPage({ size: [pdfW, pdfH], margins: { top: 0, left: 0, right: 0, bottom: 0 } });
    doc.image(s.buf, 0, 0, { width: pdfW, height: pdfH });
  }

  doc.end();
  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
  console.log("PDF creado:", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
