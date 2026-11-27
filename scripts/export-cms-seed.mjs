import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const scriptDirectory = import.meta.dirname;

const modules = new Map();
function loadContent(filename) {
  if (filename.endsWith(".json")) return JSON.parse(fs.readFileSync(filename, "utf8"));
  if (!modules.has(filename)) {
    const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    const exports = {};
    new Function("require", "exports", source)((dependency) => loadContent(path.resolve(path.dirname(filename), dependency + (dependency.endsWith(".json") ? "" : ".ts"))), exports);
    modules.set(filename, exports);
  }
  return modules.get(filename);
}

const { cmsPageDescriptors, initialPageData } = loadContent(path.join(scriptDirectory, "../src/components/cms/initialData.ts"));
const pages = cmsPageDescriptors.map(page => ({ ...page, schemaVersion: 1, componentStructureLocked: true, data: initialPageData[page.slug] }));
process.stdout.write(JSON.stringify(pages, null, 2) + "\n");
