/**
 * Deploy the CHRG token to a real Solana cluster.
 *
 * This is the one step that requires network access to a Solana RPC endpoint
 * and a funded fee-payer wallet — run it from a machine that has both. It uses
 * the exact instruction builders that the offline LiteSVM test verifies, so
 * what you test is what you ship.
 *
 * Usage:
 *   bun run src/deploy.ts [--network devnet|mainnet-beta|testnet|<rpc-url>]
 *                         [--keypair <path>]        # fee payer + mint/update authority
 *                         [--mint-keypair <path>]   # optional; generated + saved if absent
 *                         [--treasury <pubkey>]     # supply recipient owner (default: payer)
 *                         [--no-freeze-authority]   # omit a freeze authority
 *                         [--dry-run]               # simulate only, broadcast nothing
 *
 * Environment:
 *   SOLANA_NETWORK   same as --network
 *   WALLET_KEYPAIR   same as --keypair (default: ~/.config/solana/id.json)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";

import {
  ADDITIONAL_METADATA,
  INITIAL_SUPPLY_BASE_UNITS,
  INITIAL_SUPPLY_WHOLE,
  METADATA_URI,
  TOKEN_DECIMALS,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  TOKENOMICS,
} from "./config";
import {
  buildCreateMintInstructions,
  buildMintSupplyInstructions,
  buildTokenMetadata,
  getMintAccountSize,
} from "./createToken";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function resolveRpc(network: string): string {
  if (network.startsWith("http")) return network;
  if (network === "localnet" || network === "local")
    return "http://127.0.0.1:8899";
  return clusterApiUrl(network as "devnet" | "testnet" | "mainnet-beta");
}

function loadKeypair(path: string): Keypair {
  const expanded = path.startsWith("~")
    ? join(homedir(), path.slice(1))
    : path;
  const raw = JSON.parse(readFileSync(expanded, "utf-8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

function loadOrCreateMintKeypair(path: string): Keypair {
  if (existsSync(path)) return loadKeypair(path);
  const kp = Keypair.generate();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(Array.from(kp.secretKey)));
  console.log(`Generated new mint keypair -> ${path}`);
  return kp;
}

function explorer(kind: "address" | "tx", id: string, network: string): string {
  const cluster =
    network === "mainnet-beta"
      ? ""
      : `?cluster=${network.startsWith("http") ? "custom" : network}`;
  return `https://explorer.solana.com/${kind}/${id}${cluster}`;
}

async function main() {
  const network = arg("network") ?? process.env.SOLANA_NETWORK ?? "devnet";
  const rpc = resolveRpc(network);
  const walletPath =
    arg("keypair") ??
    process.env.WALLET_KEYPAIR ??
    join(homedir(), ".config/solana/id.json");
  const mintKeypairPath =
    arg("mint-keypair") ?? join(import.meta.dir, "..", "keys", "chrg-mint.json");
  const dryRun = flag("dry-run");

  const payer = loadKeypair(walletPath);
  const mint = loadOrCreateMintKeypair(mintKeypairPath);
  const treasuryOwner = arg("treasury")
    ? new PublicKey(arg("treasury") as string)
    : payer.publicKey;
  const freezeAuthority = flag("no-freeze-authority") ? null : payer.publicKey;

  console.log("──────────────────────────────────────────────");
  console.log(`  ${TOKEN_SYMBOL} — ${TOKEN_NAME}`);
  console.log("──────────────────────────────────────────────");
  console.log(`  Network        : ${network}  (${rpc})`);
  console.log(`  Fee payer      : ${payer.publicKey.toBase58()}`);
  console.log(`  Mint address   : ${mint.publicKey.toBase58()}`);
  console.log(`  Treasury owner : ${treasuryOwner.toBase58()}`);
  console.log(`  Decimals       : ${TOKEN_DECIMALS}`);
  console.log(
    `  Initial supply : ${INITIAL_SUPPLY_WHOLE.toLocaleString("en-US")} ${TOKEN_SYMBOL}` +
      `  (${INITIAL_SUPPLY_BASE_UNITS} base units)`,
  );
  console.log(
    `  Par / yield    : Rp ${TOKENOMICS.parValueIdr.toLocaleString("en-US")} @ ${TOKENOMICS.targetYieldPct}%`,
  );
  console.log("──────────────────────────────────────────────");

  const connection = new Connection(rpc, "confirmed");

  const metadata = buildTokenMetadata(mint.publicKey, payer.publicKey, {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    decimals: TOKEN_DECIMALS,
    uri: METADATA_URI,
    additionalMetadata: ADDITIONAL_METADATA,
  });

  const size = getMintAccountSize(metadata);
  const rent = await connection.getMinimumBalanceForRentExemption(size);

  const createIxs = buildCreateMintInstructions({
    payer: payer.publicKey,
    mint: mint.publicKey,
    decimals: TOKEN_DECIMALS,
    mintAuthority: payer.publicKey,
    freezeAuthority,
    metadata,
    rentLamports: rent,
  });

  const { ata, instructions: supplyIxs } = buildMintSupplyInstructions({
    payer: payer.publicKey,
    mint: mint.publicKey,
    mintAuthority: payer.publicKey,
    destinationOwner: treasuryOwner,
    amountBaseUnits: INITIAL_SUPPLY_BASE_UNITS,
  });

  const tx = new Transaction().add(...createIxs, ...supplyIxs);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer.publicKey;
  tx.sign(payer, mint);

  if (dryRun) {
    console.log("Simulating (dry run — nothing will be broadcast)…");
    const sim = await connection.simulateTransaction(tx);
    if (sim.value.err) {
      console.error("Simulation FAILED:", sim.value.err);
      console.error((sim.value.logs ?? []).join("\n"));
      process.exit(1);
    }
    console.log("Simulation OK. Compute units:", sim.value.unitsConsumed);
    console.log((sim.value.logs ?? []).join("\n"));
    return;
  }

  console.log("Sending transaction…");
  const sig = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(
    { signature: sig, blockhash, lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight },
    "confirmed",
  );

  console.log("\n✅ CHRG token created on-chain.");
  console.log(`   Treasury ATA : ${ata.toBase58()}`);
  console.log(`   Signature    : ${sig}`);
  console.log(`   Mint         : ${explorer("address", mint.publicKey.toBase58(), network)}`);
  console.log(`   Tx           : ${explorer("tx", sig, network)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
