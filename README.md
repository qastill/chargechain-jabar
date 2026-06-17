# ChargeChain — Pasar Modal Token SPKLU

**Bursa sekunder untuk jual-beli token bagi-hasil (revenue-share) dari SPKLU PLN yang sudah beroperasi di Indonesia.**

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

## Halaman / Fitur (publik)

1. **Dashboard Aset** — peta seluruh SPKLU (ukuran = volume pendapatan), daftar aset + metrik token per stasiun.
2. **Bursa Token** — order book, beli/jual token, sparkline harga, yield berjalan.
3. **Beli Token** — alur pembelian pelanggan 3 langkah.
4. **POV Investor Ritel** — simulasi return interaktif.
5. **Tokenomics & Pricing** — kalkulator valuasi interaktif (atur coupon/kWh, cap rate, beban listrik) + mekanisme tokenisasi 5 langkah.
6. **Model Bisnis & Potensi PLN** — proposisi nilai, potensi untuk PLN, aliran pendapatan PLN, business model canvas, perbandingan vs crowdfunding.
7. **Pendapatan Tidak Langsung** — uplift penjualan listrik PLN.
8. **Development Token (Skema B)** — pendanaan SPKLU baru (greenfield).
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

## Teknologi

Single-page web (HTML/CSS/JS), peta Leaflet + CartoDB dark, deploy via Vercel (`vercel.json` me-rewrite `/` → `index.html`).

## Catatan

Platform ini bersifat edukasi/simulasi. Implementasi riil memerlukan struktur hukum efek beragun aset (KIK-EBA) atau sekuritisasi/sukuk, persetujuan OJK, audit independen, serta tata kelola sesuai regulasi PLN dan pasar modal Indonesia. Bukan ajakan investasi.
</content>
</invoke>
