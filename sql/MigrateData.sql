

-- Migrate Download Counts


-- Set tsvectors
UPDATE themes
SET tsv      = SETWEIGHT(TO_TSVECTOR('english', name), 'A') || SETWEIGHT(TO_TSVECTOR('english', description), 'C'),
    tsv_tags =
        SETWEIGHT(TO_TSVECTOR('pg_catalog.english', (
            SELECT STRING_AGG(tags.name)
            FROM themes t,
                 theme_tags tt,
                 tags
            WHERE t.id = tt.item_id
              AND tt.tag_id = tags.id
              AND t.id = new.item_id
        )), 'B');
UPDATE packs
SET tsv = SETWEIGHT(TO_TSVECTOR('english', name), 'A') || SETWEIGHT(TO_TSVECTOR('english', description), 'C');
UPDATE layouts
SET tsv = SETWEIGHT(TO_TSVECTOR('english', name), 'A') || SETWEIGHT(TO_TSVECTOR('english', description), 'C');