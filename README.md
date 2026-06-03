# ChargeChain Jabar — Pasar Modal Token SPKLU

**Bursa sekunder untuk jual-beli token bagi-hasil (revenue-share) dari SPKLU yang sudah beroperasi di Jawa Barat.**

Ini **bukan** crowdfunding. Aset yang ditokenisasi adalah 329 SPKLU milik PLN yang **sudah beroperasi dan menghasilkan arus kas**. Token (Station Revenue Token / SRT) mewakili hak atas sebagian marjin pendapatan pengisian, dan diperjualbelikan di pasar sekunder layaknya efek beragun aset — bukan menggalang dana untuk aset yang belum ada.

## Dasar Data (aktual, Maret 2026)

Seluruh nilai pada platform diturunkan dari data operasional riil — bukan proyeksi:

| Metrik | Nilai |
|---|---|
| SPKLU aktif menghasilkan revenue | 329 |
| Transaksi (1 bulan) | 101.020 |
| Energi tersalur (1 bulan) | 2,26 GWh |
| Pendapatan kotor (run-rate tahunan) | ± Rp 70,7 Miliar |
| Tarif jual rata-rata | Rp 2.608 / kWh |

## Model Tokenisasi & Pricing (rasional)

Nilai token dihitung dengan pendekatan kapitalisasi pendapatan (income approach):

```
Coupon Pool / th = Energi tahunan (kWh) × coupon (Rp/kWh)
Fair Value       = Coupon Pool ÷ cap_rate
Supply token     = Fair Value ÷ par (Rp 100.000)
Yield @ par      = cap_rate (default 13%)
```

Marjin per kWh (waterfall): Tarif Rp 2.608 − PPJ Rp 142 − beban listrik Rp 1.150 − O&M Rp 366 = **Marjin Operasi Bersih Rp 950/kWh**, dialokasikan Rp 400/kWh ke pemegang token dan ± Rp 550/kWh ditahan PLN (di luar kepemilikan aset).

- **Kapitalisasi token portofolio:** ± Rp 83,4 Miliar
- **Total token beredar:** ± 837.600 unit @ Rp 100.000
- Harga di pasar sekunder bergerak via price discovery (order book): SPKLU okupansi tinggi → premium (yield turun); SPKLU sepi → diskon (yield naik).

## Halaman / Fitur

1. **Dashboard Aset** — peta seluruh SPKLU (ukuran = volume pendapatan), daftar aset + metrik token per stasiun.
2. **Bursa Token** — order book, beli/jual token, sparkline harga, yield berjalan.
3. **Tokenomics & Pricing** — kalkulator valuasi interaktif (atur coupon/kWh, cap rate, beban listrik) + mekanisme tokenisasi 5 langkah.
4. **Model Bisnis & Potensi PLN** — proposisi nilai, 7 potensi untuk PLN, aliran pendapatan PLN, business model canvas, perbandingan vs crowdfunding.
5. **Smart Contract** — simulasi kontrak distribusi bagi hasil on-chain.

## Teknologi

Single-page web (HTML/CSS/JS), peta Leaflet + CartoDB dark, deploy via Vercel (`vercel.json` me-rewrite `/` → `chargechain-jabar.html`).

## Catatan

Platform ini bersifat edukasi/simulasi. Implementasi riil memerlukan struktur hukum efek beragun aset (KIK-EBA) atau sekuritisasi/sukuk, persetujuan OJK, audit independen, serta tata kelola sesuai regulasi PLN dan pasar modal Indonesia. Bukan ajakan investasi.
