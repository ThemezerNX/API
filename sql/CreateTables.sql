-- CREATE DATABASE themezer;
-- CREATE SCHEMA IF NOT EXISTS themezer;
-- CREATE SCHEMA IF NOT EXISTS themezer_dev;

---------------------------------------------------------------------------------------
-- TABLES -----------------------------------------------------------------------------
---------------------------------------------------------------------------------------

---------------------------------------------------------------------------------------
-- TRIGGERS ---------------------------------------------------------------------------
---------------------------------------------------------------------------------------

---- pack dl_count
CREATE FUNCTION pack_dl_count_updater(item_id INT) RETURNS TRIGGER AS
$$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE packs
        SET dl_count = dl_count + 1
        WHERE id_int = item_id;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE packs
        SET dl_count = dl_count - 1
        WHERE id_int = item_id;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER pack_dlcount
    AFTER INSERT OR DELETE
    ON pack_downloads
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
EXECUTE PROCEDURE pack_dl_count_updater(id_int);

-- TRUNCATE triggers must be FOR EACH STATEMENT
CREATE TRIGGER pack_dlcount_trunc
    AFTER TRUNCATE
    ON pack_downloads
    FOR EACH STATEMENT
EXECUTE PROCEDURE pack_dl_count_updater(id_int);

---- theme dl_count
CREATE FUNCTION theme_dl_count_updater(item_id INT) RETURNS TRIGGER AS
$$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE themes
        SET dl_count = dl_count + 1
        WHERE id_int = item_id;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE themes
        SET dl_count = dl_count - 1
        WHERE id_int = item_id;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER theme_dlcount
    AFTER INSERT OR DELETE
    ON theme_downloads
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
EXECUTE PROCEDURE theme_dl_count_updater(id_int);

-- TRUNCATE triggers must be FOR EACH STATEMENT
CREATE TRIGGER theme_dlcount_trunc
    AFTER TRUNCATE
    ON theme_downloads
    FOR EACH STATEMENT
EXECUTE PROCEDURE theme_dl_count_updater(id_int);

---- layout dl_count
CREATE FUNCTION layout_dl_count_updater(item_id INT) RETURNS TRIGGER AS
$$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE layouts
        SET dl_count = dl_count + 1
        WHERE id_int = item_id;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE layouts
        SET dl_count = dl_count - 1
        WHERE id_int = item_id;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER layout_dlcount
    AFTER INSERT OR DELETE
    ON layout_downloads
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
EXECUTE PROCEDURE layout_dl_count_updater(id_int);

-- TRUNCATE triggers must be FOR EACH STATEMENT
CREATE TRIGGER layout_dlcount_trunc
    AFTER TRUNCATE
    ON layout_downloads
    FOR EACH STATEMENT
EXECUTE PROCEDURE layout_dl_count_updater(id_int);

