import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const scriptDirectory = import.meta.dirname;

const modules = new Map();
function loadContent(name) {
  if (!modules.has(name)) {
    const filename = path.join(scriptDirectory, "../src/components/cms", name + ".ts");
    const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText;
    const exports = {};
    new Function("require", "exports", source)((dependency) => loadContent(dependency), exports);
    modules.set(name, exports);
  }
  return modules.get(name);
}

const { initialPageData } = loadContent("initialData");
process.stdout.write(JSON.stringify([{
  name: "Homepage", slug: "home", route: "/", schemaVersion: 1,
  componentStructureLocked: true, data: initialPageData.home,
}, {
  name: "Contact", slug: "contact", route: "/contact", schemaVersion: 1,
  componentStructureLocked: true, data: initialPageData.contact,
}], null, 2) + "\n");
