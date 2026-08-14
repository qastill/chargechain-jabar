# CHRG — Token Solana untuk ChargeChain

Toolkit untuk membuat **CHRG** (*ChargeChain SPKLU Revenue Token*) di Solana
menggunakan standar **Token-2022 (Token Extensions)** dengan metadata on-chain
yang menyatu di dalam mint (tanpa program Metaplex terpisah).

**Prinsip: HANYA SATU koin (CHRG) — tidak ada token per-SPKLU.** CHRG di-back oleh
**satu pool berisi hanya 54 SPKLU utilisasi tinggi** (okupansi ≥ 70%, rata-rata 92%)
dari 329 SPKLU aktif di jaringan PLN — ke-54 SPKLU ini saja menghasilkan ± 69%
transaksi & ± 73% energi jaringan (arus kas terbukti):

1. **Penyangga inti (aktif)** — 54 SPKLU utilisasi tinggi yang sudah beroperasi.
2. **Ekspansi opsional · Wilayah · Latent Demand** — 324 titik rekomendasi berdemand
   laten tinggi (data GeoSPKLU); **koin yang sama (CHRG)** dicetak bertahap hanya saat
   titik terbangun & okupansinya tervalidasi tinggi.

Parameter ekonomi diturunkan langsung dari tokenomics di [`../README.md`](../README.md).

| Parameter | Nilai |
|---|---|
| Nama | ChargeChain SPKLU Revenue Token |
| Simbol | `CHRG` |
| Standar | Token-2022 (Token Extensions) + metadata extension |
| Desimal | 2 |
| Suplai | 608.928 CHRG (60.892.800 base unit) |
| Penyangga | 54 SPKLU utilisasi tinggi (okupansi ≥ 70%) |
| Par | Rp 100.000 / koin |
| Target yield | 13% |

> Proyek edukasi/simulasi. Penerbitan efek riil memerlukan struktur hukum
> (KIK-EBA/sekuritisasi), persetujuan OJK, dan audit — bukan ajakan investasi.

## Struktur

```
token/
├── src/
│   ├── config.ts        # identitas & tokenomics CHRG (satu sumber kebenaran)
│   ├── createToken.ts   # builder instruksi (dipakai test & deploy — sama persis)
│   ├── deploy.ts        # CLI: broadcast ke devnet/mainnet (perlu jaringan + wallet)
│   └── keygen.ts        # buat mint keypair (opsional vanity address)
├── test/
│   └── createToken.test.ts  # eksekusi penuh secara offline (LiteSVM, in-process VM)
├── metadata/
│   ├── chrg-token.json  # metadata off-chain (kompatibel Metaplex)
│   └── chrg-logo.svg    # logo token
└── keys/                # keypair rahasia (di-.gitignore)
```

## Prasyarat

- [Bun](https://bun.sh) (menjalankan TypeScript langsung), atau Node ≥ 18.
- Untuk **deploy on-chain**: akses ke RPC Solana + wallet fee-payer berisi SOL.

```bash
cd token
bun install
```

## Verifikasi offline (tanpa jaringan, tanpa wallet)

Test menjalankan program **Token-2022 yang asli di dalam LiteSVM** (VM Solana
in-process) lalu memastikan mint, suplai, ATA treasury, dan metadata on-chain
persis sesuai tokenomics. Ini mengeksekusi builder instruksi yang **sama** dengan
yang dipakai saat deploy — jadi apa yang diuji = apa yang di-broadcast.

```bash
bun test
```

Output yang diharapkan: `4 pass` (mint dibuat, desimal & suplai benar, metadata
cocok, dan seluruh suplai masuk ke ATA treasury).

## Deploy ke Solana (langkah yang butuh jaringan)

Jalankan dari mesin yang punya akses RPC Solana dan wallet berisi SOL.

1. (Opsional) buat mint keypair lebih dulu — bisa cari vanity address:

   ```bash
   bun run src/keygen.ts                 # simpan ke keys/chrg-mint.json
   bun run src/keygen.ts --prefix CHRG   # cari alamat berawalan "CHRG"
   ```

2. **Devnet** (gratis, untuk uji coba) — biayai wallet dengan airdrop:

   ```bash
   solana airdrop 2 <wallet-pubkey> --url devnet
   bun run src/deploy.ts --network devnet --keypair ~/.config/solana/id.json
   ```

3. **Simulasi dulu** tanpa broadcast apa pun:

   ```bash
   bun run src/deploy.ts --network devnet --dry-run
   ```

4. **Mainnet** (uang sungguhan — pastikan sudah yakin):

   ```bash
   bun run src/deploy.ts --network mainnet-beta --keypair /path/to/treasury.json
   ```

### Opsi CLI `deploy.ts`

| Flag | Arti |
|---|---|
| `--network` | `devnet` \| `mainnet-beta` \| `testnet` \| `local` \| `<rpc-url>` |
| `--keypair` | path wallet fee-payer (default `~/.config/solana/id.json`) |
| `--mint-keypair` | path mint keypair (dibuat & disimpan bila belum ada) |
| `--treasury` | pubkey pemilik ATA penerima suplai (default: fee-payer) |
| `--no-freeze-authority` | terbitkan tanpa freeze authority |
| `--dry-run` | hanya simulasi, tidak broadcast |

Setelah sukses, CLI mencetak **mint address**, **signature**, dan tautan
Solana Explorer.

## Hosting metadata

`metadata/chrg-token.json` di-serve sebagai bagian dari situs (Vercel), sehingga
`METADATA_URI` di `src/config.ts` menunjuk ke
`https://chargechain.vercel.app/token/metadata/chrg-token.json`.
Ganti bila domain berbeda, lalu deploy ulang.

## Mendaftarkan CHRG ke registry Solana Foundation

Repo [`solana-foundation/tokens`](https://github.com/solana-foundation/tokens)
adalah *source of truth* aset kanonik di Solana. Untuk mendaftarkan CHRG di sana,
token harus **sudah ada on-chain** dulu (butuh mint address dari langkah deploy).
Setelah itu ajukan mint address + metadata melalui alur kontribusi repo tersebut.
Karena itu urutannya: **deploy dulu di sini → daftarkan mint address ke registry**.

## Keamanan

- Keypair di `keys/` (mint & wallet) **rahasia** dan sudah di-`.gitignore`.
  Jangan pernah commit secret key.
- Setelah penerbitan, pertimbangkan mencabut/mengalihkan *mint authority* agar
  suplai tidak bisa ditambah, sesuai desain tokenomics (suplai tetap).
