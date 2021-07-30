-- Migrate Download Counts
INSERT INTO packs(dl_count)
SELECT COUNT(*)
FROM pack_downloads
where id