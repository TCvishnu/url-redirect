# URL Shortener

A high-throughput URL shortener built with Node.js and PostgreSQL, focused on performance, indexing, and system design.

## Tech Stack

- Node.js (Express)
- PostgreSQL
- Autocannon (benchmarking)

## Benchmark 1:

- URLs: 1,001,799
- "urls_short_code_key" UNIQUE CONSTRAINT, btree (short_code).
- Non-blocking inline click logging

```bash
autocannon -c 100 -d 20 http://localhost:3000/:random_code
```

Results:

Requests/sec: ~10,310
Avg latency: ~9.19 ms
p99 latency: ~16 ms
Total redirects: 206307 in 20s

```sql
EXPLAIN ANALYZE
SELECT original_url FROM urls WHERE short_code = '<code>';
```

- ~0.7 ms execution time

### Key Observations

- Indexed lookups keep short_code reads fast (<1ms)
- System handles ~10K req/sec on single instance
- Bottleneck is **write-heavy click logging**, not reads

## Benchmark 2:

- URLs: 1314349
- Batched Click logging with in-memory queue

```bash
autocannon -c 100 -d 20 http://localhost:3000/:random_code
```

Key Observations:

- Req/sec: ~10,877
- Avg latency: ~8.68 ms
- p99: ~13 ms
