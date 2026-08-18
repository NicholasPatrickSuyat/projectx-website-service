import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mockDir = path.join(root, "scripts", "publication-mocks");

function fileUrl(filePath) {
  return pathToFileURL(filePath).href;
}

function resolveExisting(abs) {
  const candidates = [
    abs,
    `${abs}.tsx`,
    `${abs}.ts`,
    `${abs}.jsx`,
    `${abs}.js`,
    `${abs}.mjs`,
    path.join(abs, "index.tsx"),
    path.join(abs, "index.ts"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return {
      shortCircuit: true,
      url: fileUrl(path.join(mockDir, "server-only.mjs")),
    };
  }

  if (specifier === "next/font/google") {
    return {
      shortCircuit: true,
      url: fileUrl(path.join(mockDir, "next-font-google.mjs")),
    };
  }

  if (specifier === "next/image") {
    return {
      shortCircuit: true,
      url: fileUrl(path.join(mockDir, "next-image.mjs")),
    };
  }

  if (specifier.endsWith(".css")) {
    return {
      shortCircuit: true,
      url: "data:text/javascript,export default {};",
    };
  }

  const parentPath = context.parentURL
    ? fileURLToPath(context.parentURL)
    : process.cwd();

  if (
    specifier.startsWith("@/") ||
    specifier.startsWith("./") ||
    specifier.startsWith("../")
  ) {
    const abs = specifier.startsWith("@/")
      ? path.join(root, "src", specifier.slice(2))
      : path.resolve(path.dirname(parentPath), specifier);
    const resolved = resolveExisting(abs);
    if (resolved) {
      if (resolved.endsWith(".css")) {
        return {
          shortCircuit: true,
          url: "data:text/javascript,export default {};",
        };
      }
      return { shortCircuit: true, url: fileUrl(resolved) };
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith("data:")) {
    return nextLoad(url, context);
  }

  let filePath;
  try {
    filePath = fileURLToPath(url);
  } catch {
    return nextLoad(url, context);
  }

  if (!filePath.startsWith(root) || filePath.includes(`${path.sep}node_modules${path.sep}`)) {
    return nextLoad(url, context);
  }

  if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) {
    return nextLoad(url, context);
  }

  const source = readFileSync(filePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      esModuleInterop: true,
      isolatedModules: true,
    },
    fileName: filePath,
  });

  return {
    format: "module",
    shortCircuit: true,
    source: transpiled.outputText,
  };
}
