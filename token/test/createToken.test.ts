/**
 * Offline, in-process execution of the full CHRG token creation flow.
 *
 * This runs the *real* Token-2022 program inside LiteSVM (a Solana VM running
 * in-process — no validator, no network, no funded wallet required) and
 * asserts that the mint, its supply, and its on-chain metadata come out exactly
 * as the ChargeChain tokenomics require. It exercises the identical instruction
 * builders used by the on-chain deploy CLI.
 */

import { describe, expect, test } from "bun:test";
import { Keypair, Transaction, type AccountInfo } from "@solana/web3.js";
import {
  ExtensionType,
  getExtensionData,
  unpackMint,
} from "@solana/spl-token";
import { unpack } from "@solana/spl-token-metadata";
import { LiteSVM } from "litesvm";

import {
  ADDITIONAL_METADATA,
  INITIAL_SUPPLY_BASE_UNITS,
  METADATA_URI,
  TOKEN_DECIMALS,
  TOKEN_NAME,
  TOKEN_SYMBOL,
} from "../src/config";
import {
  TOKEN_PROGRAM,
  buildCreateMintInstructions,
  buildMintSupplyInstructions,
  buildTokenMetadata,
  buildUpdateFieldInstructions,
  chunk,
  getMintAccountSize,
} from "../src/createToken";

function accountInfo(
  svm: LiteSVM,
  pubkey: Keypair["publicKey"],
): AccountInfo<Buffer> {
  const acc = svm.getAccount(pubkey);
  if (!acc) throw new Error(`account ${pubkey.toBase58()} not found`);
  return {
    data: Buffer.from(acc.data),
    owner: acc.owner,
    lamports: Number(acc.lamports),
    executable: acc.executable,
    rentEpoch: Number(acc.rentEpoch),
  };
}

describe("CHRG token creation (Token-2022, in-process)", () => {
  const svm = new LiteSVM();

  const payer = Keypair.generate();
  const mint = Keypair.generate();
  svm.airdrop(payer.publicKey, 100_000_000_000n); // 100 SOL

  const metadata = buildTokenMetadata(mint.publicKey, payer.publicKey, {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    decimals: TOKEN_DECIMALS,
    uri: METADATA_URI,
    additionalMetadata: ADDITIONAL_METADATA,
  });

  const size = getMintAccountSize(metadata);
  const rent = svm.minimumBalanceForRentExemption(BigInt(size));

  const createIxs = buildCreateMintInstructions({
    payer: payer.publicKey,
    mint: mint.publicKey,
    decimals: TOKEN_DECIMALS,
    mintAuthority: payer.publicKey,
    freezeAuthority: payer.publicKey,
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
    destinationOwner: payer.publicKey,
    amountBaseUnits: INITIAL_SUPPLY_BASE_UNITS,
  });

  // Send as separate transactions (mirrors deploy.ts) so no single tx exceeds
  // Solana's 1232-byte limit. The mint keypair only signs the create tx.
  function send(ixs: typeof createIxs, extraSigner?: Keypair): void {
    const tx = new Transaction().add(...ixs);
    tx.recentBlockhash = svm.latestBlockhash();
    tx.feePayer = payer.publicKey;
    if (extraSigner) tx.sign(payer, extraSigner);
    else tx.sign(payer);
    const res = svm.sendTransaction(tx);
    const failed = typeof (res as { err?: unknown }).err === "function";
    if (failed) {
      // @ts-expect-error dynamic litesvm result shape
      throw new Error("tx failed: " + JSON.stringify(res.meta?.().logs?.()));
    }
    svm.expireBlockhash();
  }

  // Execute the full flow once, up front, so every assertion below sees the
  // final on-chain state regardless of test ordering.
  send(createIxs, mint);
  for (const group of chunk(fieldIxs, 3)) send(group);
  send(supplyIxs);

  test("mint account exists after the create + metadata + supply flow", () => {
    expect(svm.getAccount(mint.publicKey)).not.toBeNull();
  });

  test("mint is owned by Token-2022 with correct decimals & supply", () => {
    const info = accountInfo(svm, mint.publicKey);
    expect(info.owner.toBase58()).toBe(TOKEN_PROGRAM.toBase58());

    const parsed = unpackMint(mint.publicKey, info, TOKEN_PROGRAM);
    expect(parsed.decimals).toBe(TOKEN_DECIMALS);
    expect(parsed.supply).toBe(INITIAL_SUPPLY_BASE_UNITS);
    expect(parsed.mintAuthority?.toBase58()).toBe(payer.publicKey.toBase58());
  });

  test("on-chain metadata matches the CHRG identity", () => {
    const info = accountInfo(svm, mint.publicKey);
    const parsed = unpackMint(mint.publicKey, info, TOKEN_PROGRAM);
    const tlv = getExtensionData(ExtensionType.TokenMetadata, parsed.tlvData);
    if (!tlv) throw new Error("no TokenMetadata extension on mint");
    const md = unpack(tlv);

    expect(md.name).toBe(TOKEN_NAME);
    expect(md.symbol).toBe(TOKEN_SYMBOL);
    expect(md.uri).toBe(METADATA_URI);

    const asMap = new Map(md.additionalMetadata);
    for (const [k, v] of ADDITIONAL_METADATA) {
      expect(asMap.get(k)).toBe(v);
    }
  });

  test("full initial supply lands in the treasury ATA", () => {
    const info = accountInfo(svm, ata);
    expect(info.owner.toBase58()).toBe(TOKEN_PROGRAM.toBase58());
    // Token account amount is a little-endian u64 at offset 64.
    const amount = info.data.readBigUInt64LE(64);
    expect(amount).toBe(INITIAL_SUPPLY_BASE_UNITS);
  });
});
