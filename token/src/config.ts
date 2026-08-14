/**
 * CHRG — ChargeChain SPKLU Revenue Token
 * -------------------------------------------------------------------------
 * On-chain configuration for CHRG — the SINGLE coin of the platform. There are
 * no per-SPKLU tokens: one Token-2022 mint represents a claim on the
 * revenue-share margin of a POOL containing ONLY the high-utilization /
 * high-occupancy SPKLU (EV charging stations) in PLN's Indonesian network.
 *
 * The pool is the 54 stations (out of 329 in the network) whose connector
 * occupancy is >= 70% — the top performers, which alone generate ~69% of all
 * network transactions and ~73% of energy.
 *
 * The economic parameters below are derived directly from the ChargeChain
 * tokenomics documented in the repository README (actual operational data,
 * March 2026 — not projections):
 *
 *   Coupon Pool / yr = Pool annual energy (kWh) x coupon (Rp/kWh)
 *   Fair Value       = Coupon Pool / cap_rate
 *   Supply           = Fair Value / par (Rp 100,000)
 *   Yield @ par      = cap_rate (default 13%)
 *
 *   Pool energy ~19.79 GWh/yr x Rp 400/kWh = ~Rp 7.92 B coupon pool
 *   -> ~608,928 units @ Rp 100,000 par  =>  ~Rp 60.9 Billion capitalization
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
 * ~608,928 units @ Rp 100,000 par — the single coin backed by the pool of
 * 54 high-utilization SPKLU (see README tokenomics).
 */
export const INITIAL_SUPPLY_WHOLE = 608_928n;

/** Base-unit supply actually minted = whole * 10^decimals. */
export const INITIAL_SUPPLY_BASE_UNITS =
  INITIAL_SUPPLY_WHOLE * 10n ** BigInt(TOKEN_DECIMALS);

/** Off-chain metadata JSON URI (Metaplex/Token-2022 compatible). */
export const METADATA_URI =
  "https://chargechain.vercel.app/token/metadata/chrg-token.json";

/**
 * Additional on-chain metadata fields embedded in the Token-2022 metadata
 * extension. These travel with the mint itself — no external program needed.
 */
export const ADDITIONAL_METADATA: [string, string][] = [
  ["description", "The single revenue-share coin backed by a pool of PLN's highest-utilization SPKLU EV-charging stations (Indonesia)."],
  ["asset_class", "asset-backed / revenue-share (SRT)"],
  ["par_value_idr", "100000"],
  ["target_yield", "13%"],
  ["principle", "one single coin — no per-SPKLU tokens; back only high-utilization / high-occupancy SPKLU"],
  ["backing_pool", "54 high-utilization SPKLU (occupancy >= 70%, avg 92%) out of 329 in network"],
  ["optional_expansion", "Regional · Latent Demand (324 data-validated points, minted only when built & validated)"],
  ["issuer", "ChargeChain"],
  ["project", "https://chargechain.vercel.app"],
];

/**
 * Token economics summary — informational, used by the deploy log and tests
 * to assert the minted supply matches the documented tokenomics.
 */
export const TOKENOMICS = {
  parValueIdr: 100_000,
  targetYieldPct: 13,
  couponPerKwhIdr: 400,
  backingStations: 54,
  capitalizationIdr: 60_892_836_923,
} as const;
