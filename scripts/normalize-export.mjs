import { readdir, copyFile } from "node:fs/promises";
import { resolve, join, relative, sep } from "node:path";

// Next 16.3.5's exporter uses OS separators when collecting RSC segments,
// but converts only '/' to '.'. On Windows this creates nested __next folders
// instead of the flat filenames requested by the browser. Add those exact
// filenames to the artifact; Linux exports already have the correct shape.
const root = resolve("out");
async function visit(directory, segmentRoot) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(
        file,
        segmentRoot ??
          (entry.name.startsWith("__next.") ? directory : undefined),
      );
    } else if (segmentRoot && entry.name.endsWith(".txt")) {
      const target = join(
        segmentRoot,
        relative(segmentRoot, file).split(sep).join("."),
      );
      // Do not silently overwrite if a future Next release produces both forms.
      await copyFile(file, target, 1);
    }
  }
}
if (process.platform === "win32") await visit(root);
