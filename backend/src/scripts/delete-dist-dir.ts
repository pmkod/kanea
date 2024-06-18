import fs from "node:fs";

const distSourceFile = process.cwd() + "/dist/index.js";
if (fs.existsSync(distSourceFile)) {
  fs.unlinkSync(distSourceFile);
}
const distDir = process.cwd() + "/dist";
if (fs.existsSync(distDir)) {
  fs.rmdirSync(distDir);
}

process.exit(0);
