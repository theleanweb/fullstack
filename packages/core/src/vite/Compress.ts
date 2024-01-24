import zlib from "node:zlib";
import fs from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";

const pipe = promisify(pipeline);

export async function compressFile(file: string, format: "gz" | "br" = "gz") {
  const compress =
    format == "br"
      ? zlib.createBrotliCompress({
          params: {
            [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
            [zlib.constants.BROTLI_PARAM_QUALITY]:
              zlib.constants.BROTLI_MAX_QUALITY,
            [zlib.constants.BROTLI_PARAM_SIZE_HINT]: fs.statSync(file).size,
          },
        })
      : zlib.createGzip({ level: zlib.constants.Z_BEST_COMPRESSION });

  const source = fs.createReadStream(file);
  const destination = fs.createWriteStream(`${file}.${format}`);

  await pipe(source, compress, destination);
}
