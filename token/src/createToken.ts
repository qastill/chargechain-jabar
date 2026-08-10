/**
 * Core CHRG token creation logic (Token-2022 / Token Extensions).
 *
 * These builders are transport-agnostic: they return raw instructions so the
 * exact same code path is exercised by the offline LiteSVM test and by the
 * real on-chain deploy CLI. Only the way rent is looked up and the way the
 * transaction is sent differs between the two.
 */

import {
  Keypair,
  PublicKey,
  SystemProgram,
  type TransactionInstruction,
} from "@solana/web3.js";
import {
  ExtensionType,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMintLen,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
  type TokenMetadata,
} from "@solana/spl-token-metadata";

export const TOKEN_PROGRAM = TOKEN_2022_PROGRAM_ID;

/** Everything needed to describe the CHRG mint we want to create. */
export interface TokenSpec {
  name: string;
  symbol: string;
  decimals: number;
  uri: string;
  additionalMetadata: [string, string][];
}

/**
 * Build the on-chain `TokenMetadata` struct that lives inside the mint account
 * via the Token-2022 metadata extension (self-contained — no Metaplex program).
 */
export function buildTokenMetadata(
  mint: PublicKey,
  updateAuthority: PublicKey,
  spec: TokenSpec,
): TokenMetadata {
  return {
    mint,
    name: spec.name,
    symbol: spec.symbol,
    uri: spec.uri,
    additionalMetadata: spec.additionalMetadata,
    updateAuthority,
  };
}

/**
 * Total account size (and therefore rent basis) for a Token-2022 mint that
 * carries a MetadataPointer extension plus inline TokenMetadata.
 */
export function getMintAccountSize(metadata: TokenMetadata): number {
  const mintLen = getMintLen([ExtensionType.MetadataPointer]);
  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
  return mintLen + metadataLen;
}

interface CreateMintParams {
  payer: PublicKey;
  mint: PublicKey;
  decimals: number;
  mintAuthority: PublicKey;
  freezeAuthority: PublicKey | null;
  metadata: TokenMetadata;
  /** Rent-exempt lamports for `getMintAccountSize(metadata)`. */
  rentLamports: number | bigint;
}

/**
 * Instructions that allocate and initialize the CHRG mint together with its
 * on-chain metadata. Order is significant:
 *   1. createAccount            — allocate the mint (fixed-extension size)
 *   2. initializeMetadataPointer— point the mint's metadata at itself
 *   3. initializeMint           — decimals + mint/freeze authorities
 *   4. metadata initialize      — write name/symbol/uri (reallocs the account)
 *   5. updateField*             — write each additional metadata pair
 */
export function buildCreateMintInstructions(
  p: CreateMintParams,
): TransactionInstruction[] {
  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const ixs: TransactionInstruction[] = [
    SystemProgram.createAccount({
      fromPubkey: p.payer,
      newAccountPubkey: p.mint,
      space: mintLen,
      lamports: Number(p.rentLamports),
      programId: TOKEN_PROGRAM,
    }),
    createInitializeMetadataPointerInstruction(
      p.mint,
      p.mintAuthority,
      p.mint, // metadata stored in the mint account itself
      TOKEN_PROGRAM,
    ),
    createInitializeMintInstruction(
      p.mint,
      p.decimals,
      p.mintAuthority,
      p.freezeAuthority,
      TOKEN_PROGRAM,
    ),
    createInitializeInstruction({
      programId: TOKEN_PROGRAM,
      metadata: p.mint,
      updateAuthority: p.metadata.updateAuthority as PublicKey,
      mint: p.mint,
      mintAuthority: p.mintAuthority,
      name: p.metadata.name,
      symbol: p.metadata.symbol,
      uri: p.metadata.uri,
    }),
  ];

  for (const [field, value] of p.metadata.additionalMetadata) {
    ixs.push(
      createUpdateFieldInstruction({
        programId: TOKEN_PROGRAM,
        metadata: p.mint,
        updateAuthority: p.metadata.updateAuthority as PublicKey,
        field,
        value,
      }),
    );
  }

  return ixs;
}

interface MintSupplyParams {
  payer: PublicKey;
  mint: PublicKey;
  mintAuthority: PublicKey;
  destinationOwner: PublicKey;
  amountBaseUnits: bigint;
}

/**
 * Create the treasury Associated Token Account (idempotent) and mint the full
 * initial supply of CHRG into it.
 */
export function buildMintSupplyInstructions(p: MintSupplyParams): {
  ata: PublicKey;
  instructions: TransactionInstruction[];
} {
  const ata = getAssociatedTokenAddressSync(
    p.mint,
    p.destinationOwner,
    false,
    TOKEN_PROGRAM,
  );
  const instructions: TransactionInstruction[] = [
    createAssociatedTokenAccountIdempotentInstruction(
      p.payer,
      ata,
      p.destinationOwner,
      p.mint,
      TOKEN_PROGRAM,
    ),
    createMintToInstruction(
      p.mint,
      ata,
      p.mintAuthority,
      p.amountBaseUnits,
      [],
      TOKEN_PROGRAM,
    ),
  ];
  return { ata, instructions };
}

/** Convenience: a fresh random mint keypair (the CHRG mint's address). */
export function newMintKeypair(): Keypair {
  return Keypair.generate();
}
