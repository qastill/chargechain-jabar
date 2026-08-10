/**
 * Pre-generate (and optionally vanity-search) the CHRG mint keypair.
 *
 * The mint keypair only signs the account-creation instruction once; it is not
 * a mint or freeze authority afterwards. Still, treat the secret as sensitive
 * and keep it out of version control (see .gitignore).
 *
 * Usage:
 *   bun run src/keygen.ts [--out <path>] [--prefix <base58>] [--max <tries>]
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { Keypair } from "@solana/web3.js";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const out = arg("out") ?? join(import.meta.dir, "..", "keys", "chrg-mint.json");
const prefix = arg("prefix");
const max = Number(arg("max") ?? "2000000");

let kp = Keypair.generate();
if (prefix) {
  let tries = 0;
  while (!kp.publicKey.toBase58().startsWith(prefix)) {
    if (++tries > max) {
      console.error(`Gave up after ${max} tries searching for prefix "${prefix}".`);
      process.exit(1);
    }
    kp = Keypair.generate();
  }
  console.log(`Found vanity address after ${tries} tries.`);
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(Array.from(kp.secretKey)));
console.log(`Mint address : ${kp.publicKey.toBase58()}`);
console.log(`Saved secret : ${out}`);
