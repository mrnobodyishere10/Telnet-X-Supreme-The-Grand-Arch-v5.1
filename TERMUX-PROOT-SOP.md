# Termux + proot Ubuntu SOP

Panduan ini dibuat untuk memastikan kondisi script bisa dipantau dengan cepat di lingkungan Termux + proot Ubuntu.

## 1) Tujuan Operasional
- Menjalankan CLI telnet dan modul AI secara stabil.
- Mengetahui status runtime dengan cepat (healthy/degraded/fail).
- Menangani error umum (network lambat, timeout, DNS, env salah).

## 2) Prasyarat
- Termux terpasang.
- proot distro Ubuntu aktif.
- Node.js 20+ tersedia di lingkungan Ubuntu proot.
- Repo sudah di-clone dan dependency terinstall.

## 3) Quickstart (Wajib)
Jalankan dari root project:

```bash
npm install
cd bedrock-claude && npm install && cd ..
```

Set environment dasar (contoh):

```bash
export ANTHROPIC_API_KEY="YOUR_KEY"
export CLAUDE_REQUEST_TIMEOUT_MS=45000
export CLAUDE_MAX_ATTEMPTS=2
```

Verifikasi cepat:

```bash
npm test
npm run lint
cd bedrock-claude && npm run build && cd ..
```

## 4) Healthcheck Kondisi Script (AI)
Healthcheck plain text:

```bash
cd bedrock-claude
npm run dev -- --healthcheck
```

Healthcheck JSON (lebih cocok untuk monitoring):

```bash
cd bedrock-claude
npm run dev -- --healthcheck --json
```

Interpretasi hasil:
- `status=ok`: agent bisa init + chat (kondisi sehat).
- `status=error` + `stage=init`: masalah API key/env.
- `status=error` + `stage=chat`: masalah jaringan/timeout/provider.

## 5) Healthcheck Kondisi Script (Telnet CLI)
### Single target
```bash
node src/cli.js CONNECT 127.0.0.1 23 --timeout 3000 --retries 1 --json
```

### Batch target
Buat file `targets.txt`:
```txt
127.0.0.1 23
example.com 23
```

Jalankan:
```bash
node src/cli.js BATCH targets.txt --timeout 3000 --retries 1 --concurrency 5 --json --out batch-result.json
```

Gunakan `batch-result.json` sebagai snapshot kondisi operasi.

Fitur output lanjutan:
- `--out-format ndjson` untuk format stream-friendly.
- `--append` untuk menambah hasil ke file yang sama.
- `--summary-only` untuk menyimpan ringkasan batch tanpa detail setiap host.

## 6) Mapping Error Cepat
Error code CLI yang umum:
- `TIMEOUT`: jaringan lambat/host tidak respon.
- `DNS_ERROR`: resolusi domain gagal.
- `CONNECTION_REFUSED`: port tertutup/layanan tidak aktif.
- `INVALID_INPUT`: format command/target/env tidak valid.
- `IO_ERROR`: file tidak bisa dibaca/ditulis.
- `UNKNOWN_ERROR`: butuh inspeksi log detail.

## 7) Baseline Monitoring Manual (setiap sesi)
Sebelum kerja:
1. `npm run lint`
2. `npm test`
3. `cd bedrock-claude && npm run dev -- --healthcheck --json`

Saat ada gangguan:
1. Naikkan timeout dulu (`CLAUDE_REQUEST_TIMEOUT_MS=60000`).
2. Turunkan attempts jika biaya/latensi naik (`CLAUDE_MAX_ATTEMPTS=1..2`).
3. Jalankan ulang healthcheck JSON.

Setelah perubahan kode:
1. `npm test`
2. `npm run lint`
3. `cd bedrock-claude && npm run build`
4. Simpan hasil batch `--out` untuk bukti kondisi.

Ops runner sekali jalan:
```bash
npm run ops:health
```
Perintah ini menjalankan lint, test, build `bedrock-claude`, lalu AI healthcheck, dan mengeluarkan ringkasan JSON kondisi sistem.

## 8) Checklist Siap Produksi
- [ ] `ANTHROPIC_API_KEY` ada dan valid.
- [ ] Timeout/attempt sudah diset eksplisit (jangan default buta).
- [ ] `npm test` lulus.
- [ ] `npm run lint` lulus.
- [ ] `bedrock-claude` build lulus.
- [ ] Healthcheck AI `status=ok`.
- [ ] Uji telnet single + batch minimal 1x.
- [ ] Output JSON tersimpan (`--out`) untuk audit.

## 9) Rekomendasi Nilai Awal (Termux/proot)
- `CLAUDE_REQUEST_TIMEOUT_MS=45000`
- `CLAUDE_MAX_ATTEMPTS=2`
- Telnet:
  - `--timeout 3000` s/d `5000`
  - `--retries 1` s/d `2`
  - `--concurrency 3` s/d `5` (naikkan bertahap)

## 10) Troubleshooting Ringkas
### A. Healthcheck AI gagal di `init`
- Cek `echo $ANTHROPIC_API_KEY`
- Pastikan env diekspor pada shell aktif yang sama.

### B. Healthcheck AI gagal di `chat`
- Naikkan timeout.
- Cek koneksi internet di proot.
- Coba ulang dengan attempt rendah lalu naikkan bertahap.

### C. Batch banyak gagal timeout
- Turunkan `--concurrency`.
- Naikkan `--timeout`.
- Uji satu target dulu untuk memastikan endpoint memang aktif.

### D. JSON output tidak terbaca tool lain
- Pastikan pakai `--json`.
- Untuk batch, gunakan `--out <file>` agar payload konsisten.

