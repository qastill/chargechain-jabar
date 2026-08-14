# ChargeChain — Satu Koin CHRG · Pool SPKLU Utilisasi Tinggi

**Bursa sekunder untuk jual-beli SATU koin bagi-hasil (revenue-share) yang di-back oleh pool SPKLU PLN berutilisasi tinggi yang sudah beroperasi di Indonesia.**

**Prinsip:** hanya ada **SATU koin — CHRG** (Solana Token-2022). **Tidak ada token per-SPKLU.** Yang menjadi penyangga koin **hanya SPKLU dengan utilisasi & okupansi tinggi**.

- **Penyangga inti (aktif sekarang):** dari 329 SPKLU aktif di jaringan, dipilih **hanya 54 SPKLU** dengan okupansi konektor **≥ 70%** (rata-rata 92%). Ke-54 SPKLU ini saja menghasilkan **± 69% dari seluruh transaksi** dan **± 73% energi** jaringan — arus kas terbukti, bukan proyeksi. Seluruh **608.928 koin CHRG** ditopang pool ini.
- **Ekspansi opsional (belum aktif) — Wilayah · Latent Demand:** dapat menambah penyangga di **324 titik rekomendasi** (Jabar/Banten/DKI) yang demand-nya **sudah diprediksi dari data** (101.020 transaksi riil + 331 SPKLU eksisting, 26.289 heksagon, ArcGIS). **Tetap koin yang sama: CHRG**, dicetak **bertahap** hanya saat titik dibangun & okupansinya tervalidasi tinggi.

Ini **bukan** crowdfunding spekulatif: koin di-anchor ke arus kas riil yang tervalidasi, diperjualbelikan di pasar sekunder layaknya efek beragun aset.

## Dasar Data (aktual, Maret 2026)

Seluruh nilai pada platform diturunkan dari data operasional riil — bukan proyeksi. Kolom "Jaringan" = seluruh SPKLU aktif; kolom "Pool CHRG" = 54 SPKLU utilisasi tinggi yang menjadi penyangga koin:

| Metrik | Jaringan | Pool CHRG (penyangga) |
|---|---|---|
| SPKLU | 329 | **54** (okupansi ≥ 70%) |
| Transaksi (1 bulan) | 101.020 | **69.614** (± 69%) |
| Energi tersalur (1 bulan) | 2,26 GWh | **1,65 GWh** (± 73%) |
| Pendapatan kotor (run-rate tahunan) | ± Rp 70,7 M | **± Rp 51,6 M** |
| Okupansi rata-rata | 17,6% (median) | **92%** |
| Tarif jual rata-rata | Rp 2.608 / kWh | Rp 2.608 / kWh |

## Model Tokenisasi & Pricing (rasional)

Nilai **satu koin** dihitung dengan pendekatan kapitalisasi pendapatan (income approach) atas **pool** SPKLU utilisasi tinggi:

```
Coupon Pool / th = Energi pool tahunan (kWh) × coupon (Rp/kWh)   → 19,79 GWh × Rp 400 ≈ Rp 7,92 M
Fair Value       = Coupon Pool ÷ cap_rate                        → ÷ 13% ≈ Rp 60,9 M
Supply koin      = Fair Value ÷ par (Rp 100.000)                 → ≈ 608.928 koin
Yield @ par      = cap_rate (default 13%)
```

Marjin per kWh (waterfall): Tarif Rp 2.608 − PPJ Rp 142 − beban listrik Rp 1.150 − O&M Rp 366 = **Marjin Operasi Bersih Rp 950/kWh**, dialokasikan Rp 400/kWh ke pemegang koin dan ± Rp 550/kWh ditahan PLN (di luar kepemilikan aset).

- **Kapitalisasi koin CHRG:** ± Rp 60,9 Miliar
- **Total koin beredar:** ± 608.928 unit @ Rp 100.000 — **satu koin, satu pool** (bukan per-SPKLU)
- Harga di pasar sekunder bergerak via price discovery (order book) mengikuti **okupansi gabungan seluruh pool**: okupansi pool naik → premium (yield turun); turun → diskon (yield naik).

## Halaman / Fitur (publik)

1. **Dashboard Aset** — peta 54 SPKLU penyangga (ukuran = volume pendapatan), daftar aset + bobot kontribusi tiap SPKLU ke pool CHRG (bukan token per stasiun).
2. **Bursa CHRG** — order book satu koin, beli/jual CHRG, sparkline harga, yield berjalan.
3. **Beli Koin CHRG** — alur pembelian pelanggan 3 langkah (tanpa memilih stasiun — langsung beli koin).
4. **Prospektus & Valuasi** — penjelasan value koin untuk pembeli: proposisi nilai, **AUM** (fair value pool = Rp 60,9 M), perhitungan valuasi langkah‑demi‑langkah (energi → coupon pool → fair value → suplai → NAV/koin → yield), NAV/koin (Rp 100.000 par) vs harga pasar (Rp 118.000), proyeksi 3 skenario (konservatif/basis/optimis) + analisis sensitivitas cap rate & coupon/kWh.
4. **POV Investor Ritel** — simulasi return interaktif.
5. **Tokenomics & Pricing** — kalkulator valuasi interaktif (atur coupon/kWh, cap rate, beban listrik) + mekanisme tokenisasi 5 langkah.
6. **Model Bisnis & Potensi PLN** — proposisi nilai, potensi untuk PLN, aliran pendapatan PLN, business model canvas, perbandingan vs crowdfunding.
7. **Pendapatan Tidak Langsung** — uplift penjualan listrik PLN.
8. **Ekspansi Wilayah — Latent Demand (opsional)** — 324 titik rekomendasi berdemand laten tinggi (data GeoSPKLU): KPI, tiga skenario proyeksi (p20/p50/p80), sebaran per jalur seleksi / tipe lokasi / kabupaten, dan cara suplai **koin yang sama (CHRG)** bertambah bertahap saat titik terbukti utilisasi tinggi.
9. **Kemitraan ⇄ Blockchain** — integrasi skema kemitraan SPKLU PLN dengan settlement on-chain.
10. **Smart Contract** — simulasi kontrak distribusi bagi hasil on-chain.

## Area Internal Tim (Admin)

Bahan persiapan internal — **tidak ditampilkan ke publik/juri**: antisipasi pertanyaan dewan juri, daftar kelemahan jujur model & cara mengatasinya.

- Diakses lewat tombol gembok (🔒) di bagian bawah sidebar, atau URL `…/#admin`.
- Dilindungi gerbang kata sandi sederhana di sisi klien (lihat konstanta `ADMIN_PW` di `index.html`). Ini menyembunyikan materi dari pengunjung biasa, **bukan** keamanan kriptografis — jangan menaruh rahasia sungguhan di sini.

### Berkas internal & privasi (folder `admin/`)

Proposal dan berkas sumber data — termasuk **data pelanggan/PII** — disimpan di folder `admin/` dan **dikecualikan dari deploy publik** lewat `.vercelignore`:

- `ChargeChain-Proposal-IG2026.pptx` — proposal.
- `Data SPKLU.xlsx`, `Master SPKLU Maret 2026.xlsx`, `Detail Transaksi SPKLU 202603.xlsx` — data operasional.
- `DataMasterPelangganKBLBB (2).xls` — **data master pelanggan (sensitif/PII)**.

Berkas-berkas ini tetap tersedia untuk tim lewat repo privat, tetapi **tidak pernah diunggah ke Vercel** sehingga tidak bisa diakses publik/juri.

## Token On-Chain (CHRG di Solana)

Token **CHRG** (*ChargeChain SPKLU Revenue Token*) diimplementasikan sebagai
**Token-2022 (Token Extensions)** di Solana dengan metadata on-chain. Toolkit
lengkap — konfigurasi, builder instruksi, test eksekusi offline (LiteSVM),
serta CLI deploy ke devnet/mainnet — ada di folder [`token/`](token/).

- Suplai **608.928 CHRG** (2 desimal), par Rp 100.000, target yield 13% —
  satu koin yang di-back pool 54 SPKLU utilisasi tinggi, diturunkan langsung
  dari tokenomics di atas.
- `cd token && bun install && bun test` memverifikasi pembuatan token secara
  penuh tanpa jaringan (program Token-2022 asli dijalankan in-process).
- `bun run src/deploy.ts --network devnet` menerbitkan token ke Solana
  (perlu akses RPC + wallet berisi SOL). Lihat [`token/README.md`](token/README.md).

## Teknologi

Single-page web (HTML/CSS/JS), peta Leaflet + CartoDB dark, deploy via Vercel (`vercel.json` me-rewrite `/` → `index.html`). Token on-chain: Solana Token-2022 via `@solana/web3.js` + `@solana/spl-token` (lihat `token/`).

## Catatan

Platform ini bersifat edukasi/simulasi. Implementasi riil memerlukan struktur hukum efek beragun aset (KIK-EBA) atau sekuritisasi/sukuk, persetujuan OJK, audit independen, serta tata kelola sesuai regulasi PLN dan pasar modal Indonesia. Bukan ajakan investasi.
</content>
</invoke>
