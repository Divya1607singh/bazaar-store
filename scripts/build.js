// Copies the site to dist/ and adds ?v=<commit> to local CSS/JS so browsers never serve stale files.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "dist");
const FILES = ["index.html", "dashboard.html", "style.css", "script.js", "data.js"];
const v = (process.env.GITHUB_SHA || "dev").slice(0, 7);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
for (const f of FILES) {
  let s = fs.readFileSync(path.join(ROOT, f), "utf8");
  if (f.endsWith(".html")) s = s.replace(/(src|href)="(style\.css|script\.js|data\.js)"/g, `$1="$2?v=${v}"`);
  fs.writeFileSync(path.join(OUT, f), s);
}
fs.writeFileSync(path.join(OUT, "version.txt"), v + "\n");
console.log(`✓ Built ${FILES.length} files into dist/ (version ${v})`);
