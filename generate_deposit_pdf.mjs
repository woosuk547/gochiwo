import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";

const htmlPath = new URL("./quote_deposit.html", import.meta.url);
const signaturePath = new URL("../우석님-사인.png", import.meta.url);
const outputPath = new URL("./견적서_착수금.pdf", import.meta.url);

const [html, signature] = await Promise.all([
  readFile(htmlPath, "utf8"),
  readFile(signaturePath),
]);

const renderedHtml = html.replace(
  "__SIGNATURE__",
  `data:image/png;base64,${signature.toString("base64")}`,
);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.setContent(renderedHtml, { waitUntil: "networkidle" });
const pdf = await page.pdf({
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
});

await browser.close();
await writeFile(outputPath, pdf);
