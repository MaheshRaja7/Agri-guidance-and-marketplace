/**
 * Simple parser for NumPy .npy files (format version 1.0 / 2.0).
 * Only supports float32 / float64 C-contiguous arrays.
 */
import * as fs from "fs";

interface NpyResult {
  shape: number[];
  data: Float32Array;
}

export function parseNpy(filePath: string): NpyResult {
  const buf = fs.readFileSync(filePath);

  // — magic: \x93NUMPY
  const magic = buf.slice(0, 6).toString("latin1");
  if (magic !== "\x93NUMPY") {
    throw new Error("Not a valid .npy file");
  }

  const majorVersion = buf[6];
  // Header length
  let headerLen: number;
  let headerOffset: number;
  if (majorVersion === 1) {
    headerLen = buf.readUInt16LE(8);
    headerOffset = 10;
  } else {
    headerLen = buf.readUInt32LE(8);
    headerOffset = 12;
  }

  const headerStr = buf.slice(headerOffset, headerOffset + headerLen).toString("latin1");

  // Parse shape from header, e.g. 'shape': (172, 1280),
  const shapeMatch = headerStr.match(/'shape'\s*:\s*\(([^)]*)\)/);
  if (!shapeMatch) throw new Error("Could not parse shape from .npy header");
  const shape = shapeMatch[1]
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number);

  // Parse dtype — we only handle little-endian float32 (<f4) and float64 (<f8)
  const dtypeMatch = headerStr.match(/'descr'\s*:\s*'([^']*)'/);
  if (!dtypeMatch) throw new Error("Could not parse dtype from .npy header");
  const dtype = dtypeMatch[1];

  const dataOffset = headerOffset + headerLen;
  const rawBuf = buf.slice(dataOffset);

  let data: Float32Array;
  if (dtype === "<f4" || dtype === "float32") {
    data = new Float32Array(rawBuf.buffer, rawBuf.byteOffset, rawBuf.byteLength / 4);
  } else if (dtype === "<f8" || dtype === "float64") {
    // Convert float64 → float32
    const f64 = new Float64Array(rawBuf.buffer, rawBuf.byteOffset, rawBuf.byteLength / 8);
    data = new Float32Array(f64.length);
    for (let i = 0; i < f64.length; i++) data[i] = f64[i];
  } else {
    throw new Error(`Unsupported dtype: ${dtype}`);
  }

  return { shape, data };
}
