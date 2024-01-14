import buffer from "node:buffer";
import { webcrypto as crypto } from "node:crypto";

const File = buffer.File;

const globals: Record<string, any> = {
  crypto,
  File,
};

// exported for dev/preview and node environments
/**
 * Make various web APIs available as globals:
 * - `crypto`
 * - `File`
 */
export function installPolyfills() {
  for (const name in globals) {
    if (name in globalThis) continue;

    Object.defineProperty(globalThis, name, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: globals[name],
    });
  }
}
