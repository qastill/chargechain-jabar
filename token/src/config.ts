/**
 * CHRG — ChargeChain SPKLU Revenue Token
 * -------------------------------------------------------------------------
 * On-chain configuration for the CHRG token, a Token-2022 (Token Extensions)
 * mint that represents a claim on the revenue-share margin of PLN's operating
 * SPKLU (EV charging station) network in Indonesia.
 *
 * The economic parameters below are derived directly from the ChargeChain
 * tokenomics documented in the repository README (actual operational data,
 * March 2026 — not projections):
 *
 *   Coupon Pool / yr = Annual energy (kWh) x coupon (Rp/kWh)
 *   Fair Value       = Coupon Pool / cap_rate
 *   Supply           = Fair Value / par (Rp 100,000)
 *   Yield @ par      = cap_rate (default 13%)
 *
 *   -> ~837,600 units @ Rp 100,000 par  =>  ~Rp 83.4 Billion capitalization
 */

/** Human token identity (shown by wallets and explorers). */
export const TOKEN_NAME = "ChargeChain SPKLU Revenue Token";
export const TOKEN_SYMBOL = "CHRG";

/**
 * Decimals. The par unit is one whole token (Rp 100,000). We use 2 decimals
 * so units can be traded in fractional lots on a secondary market while the
 * whole-unit par semantics remain intact.
 */
export const TOKEN_DECIMALS = 2;

/**
 * Initial supply in whole tokens (before applying decimals).
 * ~837,600 units @ Rp 100,000 par (see README tokenomics).
 */
export const INITIAL_SUPPLY_WHOLE = 837_600n;

/** Base-unit supply actually minted = whole * 10^decimals. */
export const INITIAL_SUPPLY_BASE_UNITS =
  INITIAL_SUPPLY_WHOLE * 10n ** BigInt(TOKEN_DECIMALS);

/** Off-chain metadata JSON URI (Metaplex/Token-2022 compatible). */
export const METADATA_URI =
  "https://chargechain-jabar.vercel.app/token/metadata/chrg-token.json";

/**
 * Additional on-chain metadata fields embedded in the Token-2022 metadata
 * extension. These travel with the mint itself — no external program needed.
 */
export const ADDITIONAL_METADATA: [string, string][] = [
  ["description", "Revenue-share token for PLN's operating SPKLU network (Indonesia)."],
  ["asset_class", "asset-backed / revenue-share (SRT)"],
  ["par_value_idr", "100000"],
  ["target_yield", "13%"],
  ["issuer", "ChargeChain"],
  ["project", "https://chargechain-jabar.vercel.app"],
];

/**
 * Token economics summary — informational, used by the deploy log and tests
 * to assert the minted supply matches the documented tokenomics.
 */
export const TOKENOMICS = {
  parValueIdr: 100_000,
  targetYieldPct: 13,
  couponPerKwhIdr: 400,
  capitalizationIdr: 83_400_000_000,
} as const;
