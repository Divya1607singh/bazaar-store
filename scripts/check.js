// Dependency-free checks: JS syntax (including inline <script>) and missing local files.
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const files = fs.readdirSync(ROOT).filter(f => /\.(html|js)$/.test(f));
let errors = 0;
const fail = m => { console.error("✗ " + m); errors++; };

for (const f of files) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  if (f.endsWith(".js")) {
    try { new vm.Script(src, { filename: f }); } catch (e) { fail(`${f}: ${e.message}`); }
  } else {
    for (const m of src.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      try { new vm.Script(m[1], { filename: f + " (inline)" }); } catch (e) { fail(`${f} inline script: ${e.message}`); }
    }
    for (const m of src.matchAll(/(?:src|href)="([^"#:]+\.(?:js|css|html))"/g)) {
      if (!fs.existsSync(path.join(ROOT, m[1]))) fail(`${f} references missing file ${m[1]}`);
    }
  }
}
if (errors) process.exit(1);
console.log(`✓ ${files.length} files OK`);
