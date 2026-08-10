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
  type TransactionInstruction,
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
  buildUpdateFieldInstructions,
  chunk,
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

  const fieldIxs = buildUpdateFieldInstructions(
    mint.publicKey,
    payer.publicKey,
    ADDITIONAL_METADATA,
  );

  const { ata, instructions: supplyIxs } = buildMintSupplyInstructions({
    payer: payer.publicKey,
    mint: mint.publicKey,
    mintAuthority: payer.publicKey,
    destinationOwner: treasuryOwner,
    amountBaseUnits: INITIAL_SUPPLY_BASE_UNITS,
  });

  // Batch into transactions that stay under Solana's 1232-byte limit:
  //   1. create mint + base metadata (signed by payer + mint keypair)
  //   2. additional metadata fields, chunked
  //   3. create treasury ATA + mint the full supply
  const batches: { label: string; ixs: TransactionInstruction[]; signMint?: boolean }[] = [
    { label: "create mint + metadata", ixs: createIxs, signMint: true },
    ...chunk(fieldIxs, 3).map((ixs, i) => ({ label: `metadata fields #${i + 1}`, ixs })),
    { label: "create treasury ATA + mint supply", ixs: supplyIxs },
  ];

  async function buildTx(ixs: TransactionInstruction[], signMint: boolean) {
    const tx = new Transaction().add(...ixs);
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer.publicKey;
    if (signMint) tx.sign(payer, mint);
    else tx.sign(payer);
    return { tx, blockhash, lastValidBlockHeight };
  }

  if (dryRun) {
    console.log("Simulating (dry run — nothing will be broadcast)…");
    for (const b of batches) {
      const { tx } = await buildTx(b.ixs, b.signMint ?? false);
      const sim = await connection.simulateTransaction(tx);
      if (sim.value.err) {
        console.error(`Simulation FAILED (${b.label}):`, sim.value.err);
        console.error((sim.value.logs ?? []).join("\n"));
        process.exit(1);
      }
      console.log(`  ✓ ${b.label} — CU ${sim.value.unitsConsumed ?? "?"}`);
    }
    console.log("All batches simulate OK.");
    return;
  }

  const sigs: string[] = [];
  for (const b of batches) {
    console.log(`Sending: ${b.label}…`);
    const { tx, blockhash, lastValidBlockHeight } = await buildTx(
      b.ixs,
      b.signMint ?? false,
    );
    const sig = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      "confirmed",
    );
    sigs.push(sig);
  }

  console.log("\n✅ CHRG token created on-chain.");
  console.log(`   Treasury ATA : ${ata.toBase58()}`);
  console.log(`   Signatures   : ${sigs.length} tx`);
  console.log(`   Mint         : ${explorer("address", mint.publicKey.toBase58(), network)}`);
  console.log(`   Last tx      : ${explorer("tx", sigs[sigs.length - 1], network)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
