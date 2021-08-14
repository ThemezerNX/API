-- CREATE DATABASE themezer;
-- CREATE SCHEMA IF NOT EXISTS themezer;
DROP SCHEMA dev CASCADE;
CREATE SCHEMA IF NOT EXISTS dev;

---------------------------------------------------------------------------------------
-- TABLES -----------------------------------------------------------------------------
---------------------------------------------------------------------------------------

CREATE TABLE users
(
    counter          SERIAL,
    id               VARCHAR GENERATED ALWAYS AS (
                         lpad(('x' || substr(md5(counter::VARCHAR), 1, 16))::BIT(63)::BIGINT::VARCHAR, 19, '0')
                         ) STORED,
    joined_timestamp TIMESTAMP   NOT NULL DEFAULT now(),
    has_accepted     BOOL        NOT NULL DEFAULT FALSE,
    is_admin         BOOLEAN     NOT NULL DEFAULT FALSE,
    is_blocked       BOOL        NOT NULL DEFAULT FALSE,
    roles            VARCHAR[]   NOT NULL DEFAULT '{}',
    email            VARCHAR UNIQUE,
    username         VARCHAR(32) NOT NULL,

    PRIMARY KEY (id)
);

CREATE TABLE user_profiles
(
    user_id     CHAR(19),
    bio         VARCHAR(10000),
    avatar_file BYTEA,                -- TODO
    banner_file BYTEA,                -- TODO
    color       CHAR(6),
    random_uuid UUID UNIQUE NOT NULL, -- TODO

    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE user_preferences
(
    user_id   CHAR(19),
    show_nsfw BOOLEAN,

    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE users_discord
(
    user_id       CHAR(19),
    username      VARCHAR NOT NULL,
    discriminator INT     NOT NULL,
    avatar_hash   VARCHAR NOT NULL,

    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE packs
(
    counter           SERIAL,
    id                VARCHAR GENERATED ALWAYS AS (to_hex(counter)) STORED,
    user_id           CHAR(19)     NOT NULL,
    name              VARCHAR(100) NOT NULL,
    description       VARCHAR(1000),
    added_timestamp   TIMESTAMP    NOT NULL DEFAULT now(),
    updated_timestamp TIMESTAMP    NOT NULL DEFAULT now(),
    dl_count          BIGINT       NOT NULL DEFAULT 0,
    is_nsfw           BOOL         NOT NULL DEFAULT FALSE,
    tsv               TSVECTOR,
    random_uuid       UUID UNIQUE  NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE targets
(
    id   INT UNIQUE     NOT NULL,
    name VARCHAR UNIQUE NOT NULL,

    PRIMARY KEY (id)
);

CREATE TABLE layouts
(
    counter            SERIAL,
    id                 VARCHAR GENERATED ALWAYS AS (to_hex(counter)) STORED,
    uuid               UUID UNIQUE   NOT NULL,
    user_id            CHAR(19)      NOT NULL,
    name               VARCHAR(100)  NOT NULL,
    description        VARCHAR(1000),
    added_timestamp    TIMESTAMP     NOT NULL DEFAULT now(),
    updated_timestamp  TIMESTAMP     NOT NULL DEFAULT now(),
    target_id          INT           NOT NULL,
    dl_count           BIGINT        NOT NULL DEFAULT 0,
    color              CHAR(6),
    layout_json        JSON,
    common_layout_json JSON,
    image_file         BYTEA         NOT NULL,
    tsv                TSVECTOR,
    random_uuid        UUID UNIQUE   NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE,
    FOREIGN KEY (target_id) REFERENCES targets (id) ON UPDATE CASCADE
);

CREATE TABLE layout_options
(
    id        SERIAL,
    "order"   INT     NOT NULL,
    layout_id VARCHAR NOT NULL,
    name      VARCHAR NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (layout_id) REFERENCES layouts (id) ON DELETE CASCADE
);

CREATE TABLE layout_option_values
(
    option_id  INT,
    value_name VARCHAR,
    uuid       UUID UNIQUE NOT NULL,
    json       VARCHAR     NOT NULL,
    image_file BYTEA       NOT NULL,

    PRIMARY KEY (option_id, value_name),
    FOREIGN KEY (option_id) REFERENCES layout_options (id) ON DELETE CASCADE
);

CREATE TABLE themes
(
    counter           SERIAL,
    id                VARCHAR GENERATED ALWAYS AS (to_hex(counter)) STORED,
    user_id           CHAR(19)     NOT NULL,
    pack_id           VARCHAR,
    name              VARCHAR(100) NOT NULL,
    description       VARCHAR(1000),
    added_timestamp   TIMESTAMP    NOT NULL DEFAULT now(),
    updated_timestamp TIMESTAMP    NOT NULL DEFAULT now(),
    target_id         INT          NOT NULL,
    dl_count          BIGINT       NOT NULL DEFAULT 0,
    is_nsfw           BOOL         NOT NULL DEFAULT FALSE,
    layout_id         VARCHAR,
    tsv               TSVECTOR,
    tsv_tags          TSVECTOR,
    random_uuid       UUID UNIQUE  NOT NULL,


    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (target_id) REFERENCES targets (id) ON UPDATE CASCADE,
    FOREIGN KEY (layout_id) REFERENCES layouts (id),
    FOREIGN KEY (pack_id) REFERENCES packs (id) ON DELETE CASCADE
);

CREATE TABLE hbthemes
(
    counter           SERIAL,
    id                VARCHAR GENERATED ALWAYS AS (to_hex(counter)) STORED,
    user_id           CHAR(19)    NOT NULL,
    name              VARCHAR     NOT NULL,
    description       VARCHAR,
    added_timestamp   TIMESTAMP   NOT NULL DEFAULT now(),
    updated_timestamp TIMESTAMP   NOT NULL DEFAULT now(),
    dl_count          BIGINT      NOT NULL DEFAULT 0,
    is_nsfw           BOOL        NOT NULL DEFAULT FALSE,
    theme_cfg         VARCHAR     NOT NULL,
    tsv               TSVECTOR,
    tsv_tags          TSVECTOR,
    random_uuid       UUID UNIQUE NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
);

CREATE TABLE theme_assets
(
    theme_id                  VARCHAR,
    custom_layout_json        JSON,
    custom_common_layout_json JSON,
    image_file                BYTEA,
    album_icon_file           BYTEA,
    news_icon_file            BYTEA,
    shop_icon_file            BYTEA,
    controller_icon_file      BYTEA,
    settings_icon_file        BYTEA,
    power_icon_file           BYTEA,

    PRIMARY KEY (theme_id),
    FOREIGN KEY (theme_id) REFERENCES themes (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE theme_previews
(
    theme_id               VARCHAR,
    image_720_file         BYTEA NOT NULL,
    image_360_file         BYTEA NOT NULL,
    image_240_file         BYTEA NOT NULL,
    image_180_file         BYTEA NOT NULL,
    image_placeholder_file BYTEA NOT NULL,

    PRIMARY KEY (theme_id),
    FOREIGN KEY (theme_id) REFERENCES themes (id) ON DELETE CASCADE ON UPDATE CASCADE
);



CREATE TABLE hbtheme_assets
(
    hbtheme_id            VARCHAR,
    battery_icon_file     BYTEA,
    charging_icon_file    BYTEA,
    folder_icon_file      BYTEA,
    invalid_icon_file     BYTEA,
    theme_icon_dark       BYTEA,
    theme_icon_light      BYTEA,
    airplaine_icon_file   BYTEA,
    wifi_none_icon_file   BYTEA,
    wifi1_icon_file       BYTEA,
    wifi2_icon_file       BYTEA,
    wifi3_icon_file       BYTEA,
    eth_icon_file         BYTEA,
    background_image_file BYTEA,


    PRIMARY KEY (hbtheme_id),
    FOREIGN KEY (hbtheme_id) REFERENCES hbthemes (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE hbtheme_previews
(
    hbtheme_id             VARCHAR,
    image_720_file         BYTEA NOT NULL,
    image_360_file         BYTEA NOT NULL,
    image_240_file         BYTEA NOT NULL,
    image_180_file         BYTEA NOT NULL,
    image_placeholder_file BYTEA NOT NULL,

    PRIMARY KEY (hbtheme_id),
    FOREIGN KEY (hbtheme_id) REFERENCES hbthemes (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE tags
(
    id   SERIAL,
    name VARCHAR UNIQUE NOT NULL,

    PRIMARY KEY (id)
);

CREATE TABLE theme_tags
(
    theme_id VARCHAR,
    tag_id   INT,

    PRIMARY KEY (theme_id, tag_id),
    FOREIGN KEY (tag_id) REFERENCES tags (id),
    FOREIGN KEY (theme_id) REFERENCES themes (id)
);

CREATE TABLE download_clients
(
    id         SERIAL,
    user_agent VARCHAR UNIQUE,

    PRIMARY KEY (id)
);

CREATE TABLE pack_downloads
(
    pack_id            VARCHAR,
    timestamp          TIMESTAMP NOT NULL DEFAULT now(),
    user_id            CHAR(19),
    download_client_id INT,

    PRIMARY KEY (pack_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (pack_id) REFERENCES packs (id) ON DELETE CASCADE,
    FOREIGN KEY (download_client_id) REFERENCES download_clients (id)
);

CREATE TABLE theme_downloads
(
    theme_id           VARCHAR,
    timestamp          TIMESTAMP NOT NULL DEFAULT now(),
    user_id            CHAR(19),
    download_client_id INT,

    PRIMARY KEY (theme_id),
    FOREIGN KEY (theme_id) REFERENCES themes (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (download_client_id) REFERENCES download_clients (id)
);

CREATE TABLE layout_downloads
(
    layout_id          VARCHAR,
    timestamp          TIMESTAMP NOT NULL DEFAULT now(),
    user_id            CHAR(19),
    download_client_id INT,

    PRIMARY KEY (layout_id),
    FOREIGN KEY (layout_id) REFERENCES layouts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (download_client_id) REFERENCES download_clients (id)
);

CREATE TABLE creator_likes
(
    creator_id CHAR(19),
    timestamp  TIMESTAMP NOT NULL DEFAULT now(),
    user_id    CHAR(19)  NOT NULL,

    PRIMARY KEY (creator_id),
    FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE layout_likes
(
    layout_id VARCHAR,
    timestamp TIMESTAMP NOT NULL DEFAULT now(),
    user_id   CHAR(19)  NOT NULL,

    PRIMARY KEY (layout_id),
    FOREIGN KEY (layout_id) REFERENCES layouts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE pack_likes
(
    pack_id   VARCHAR,
    timestamp TIMESTAMP NOT NULL DEFAULT now(),
    user_id   CHAR(19)  NOT NULL,

    PRIMARY KEY (pack_id),
    FOREIGN KEY (pack_id) REFERENCES packs (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE theme_likes
(
    theme_id  VARCHAR,
    timestamp TIMESTAMP NOT NULL DEFAULT now(),
    user_id   CHAR(19)  NOT NULL,

    PRIMARY KEY (theme_id),
    FOREIGN KEY (theme_id) REFERENCES themes (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE hbtheme_likes
(
    hbtheme_id VARCHAR,
    timestamp  TIMESTAMP NOT NULL DEFAULT now(),
    user_id    CHAR(19)  NOT NULL,

    PRIMARY KEY (hbtheme_id),
    FOREIGN KEY (hbtheme_id) REFERENCES hbthemes (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE pack_cache
(
    pack_id   VARCHAR,
    timestamp TIMESTAMP NOT NULL DEFAULT now(),
    file      BYTEA     NOT NULL,
    file_name VARCHAR   NOT NULL,

    PRIMARY KEY (pack_id),
    FOREIGN KEY (pack_id) REFERENCES packs (id) ON DELETE CASCADE
);

CREATE TABLE theme_cache
(
    theme_id  VARCHAR,
    timestamp TIMESTAMP NOT NULL DEFAULT now(),
    file      BYTEA     NOT NULL,
    file_name VARCHAR   NOT NULL,

    PRIMARY KEY (theme_id),
    FOREIGN KEY (theme_id) REFERENCES themes (id) ON DELETE CASCADE
);

CREATE TABLE hbtheme_cache
(
    hbtheme_id VARCHAR,
    timestamp  TIMESTAMP NOT NULL DEFAULT now(),
    file       BYTEA     NOT NULL,
    file_name  VARCHAR   NOT NULL,

    PRIMARY KEY (hbtheme_id),
    FOREIGN KEY (hbtheme_id) REFERENCES hbthemes (id) ON DELETE CASCADE
);

---------------------------------------------------------------------------------------
-- DEFAULTS ---------------------------------------------------------------------------
---------------------------------------------------------------------------------------

INSERT INTO targets (id, name)
VALUES (1, 'ResidentMenu'),
       (2, 'Entrance'),
       (3, 'Flaunch'),
       (4, 'Set'),
       (5, 'Psl'),
       (6, 'MyPage'),
       (7, 'Notification');

---------------------------------------------------------------------------------------
-- FUNCTIONS --------------------------------------------------------------------------
---------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION to_int(hex VARCHAR) RETURNS INTEGER AS
$$
DECLARE
    r INT;
BEGIN
    EXECUTE E'select x\'' || hex || E'\'::int' INTO r;
    RETURN r;
END
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION to_int IS 'Convert hex to int';

CREATE OR REPLACE FUNCTION count_approximate(table_name VARCHAR) RETURNS VARCHAR AS
$$
BEGIN
    RETURN (
        SELECT ((reltuples / (CASE WHEN relpages = 0 THEN 1 ELSE relpages END))
            * (pg_relation_size(table_name) / current_setting('block_size')::INT)
                   )::INT
        FROM pg_class
        WHERE oid = table_name::REGCLASS
    );
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION count_approximate IS 'Returns an approximate row count for a table. Often not more than 10% off';

-- Aggregate tsvector rows
CREATE AGGREGATE tsvector_agg (TSVECTOR) (
    STYPE = pg_catalog.TSVECTOR,
    SFUNC = pg_catalog.tsvector_concat,
    INITCOND = ''
    );

-- Create array of all tags for a theme
CREATE OR REPLACE FUNCTION is_pack_nsfw(pack_id VARCHAR) RETURNS BOOLEAN AS
$$
BEGIN
    RETURN (
        SELECT count(*) > 0
        FROM packs p,
             themes t
        WHERE t.pack_id = p.id
          AND p.id = is_pack_nsfw.pack_id
          AND t.is_nsfw
    );
END;
$$ LANGUAGE plpgsql;

-- Create array of all tags for a theme
CREATE OR REPLACE FUNCTION theme_tags(theme_id VARCHAR) RETURNS VARCHAR[] AS
$$
BEGIN
    RETURN (
        SELECT array_agg(tags.name)
        FROM themes t,
             theme_tags tt,
             tags
        WHERE t.id = tt.theme_id
          AND tt.tag_id = tags.id
          AND t.id = theme_tags.theme_id
    );
END;
$$ LANGUAGE plpgsql;

---------------------------------------------------------------------------------------
-- VIEWS ------------------------------------------------------------------------------
---------------------------------------------------------------------------------------

CREATE VIEW packs_with_tsv AS
SELECT p.*, tsvector_concat(p.tsv, tsvector_agg(t.tsv_tags)) AS tsv_all
FROM packs p,
     themes t
WHERE t.pack_id = p.id
GROUP BY p.id;

---------------------------------------------------------------------------------------
-- INDEXES & TRIGGERS -----------------------------------------------------------------
---------------------------------------------------------------------------------------

-- create tsvector out of name and description
CREATE FUNCTION pack_and_theme_tsv_trigger() RETURNS TRIGGER AS
$$
BEGIN
    new.tsv :=
                    setweight(to_tsvector('pg_catalog.english', coalesce(new.name, '')), 'A') ||
                    setweight(to_tsvector('pg_catalog.english', coalesce(new.description, '')), 'C') ||
                    to_tsvector('pg_catalog.english', coalesce(CASE WHEN new.is_nsfw THEN 'NSFW' END, ''));
    RETURN new;
END
$$ LANGUAGE plpgsql;

-- create tsvector out of name and description
CREATE FUNCTION layout_tsv_trigger() RETURNS TRIGGER AS
$$
BEGIN
    new.tsv :=
                setweight(to_tsvector('pg_catalog.english', coalesce(new.name, '')), 'A') ||
                setweight(to_tsvector('pg_catalog.english', coalesce(new.description, '')), 'C');
    RETURN new;
END
$$ LANGUAGE plpgsql;


-- create tsvector out of tags
CREATE FUNCTION theme_tsv_tags_trigger() RETURNS TRIGGER AS
$$
BEGIN
    UPDATE themes
    SET tsv_tags =
            setweight(to_tsvector('pg_catalog.english', array_to_string(theme_tags(new.theme_id), ' ')), 'B')
    WHERE id = new.theme_id;
END
$$ LANGUAGE plpgsql;

-- packs_tsv
DROP INDEX IF EXISTS packs_tsv_index;
CREATE INDEX packs_tsv_index ON packs
    USING gin (tsv);

DROP TRIGGER IF EXISTS packs_tsv ON packs;
CREATE TRIGGER packs_tsv
    BEFORE INSERT OR UPDATE
    ON packs
    FOR EACH ROW
EXECUTE PROCEDURE
    pack_and_theme_tsv_trigger();

-- themes_tsv
DROP INDEX IF EXISTS themes_tsv_index;
CREATE INDEX themes_tsv_index ON themes
    USING gin (tsv);

DROP TRIGGER IF EXISTS themes_tsv ON themes;
CREATE TRIGGER themes_tsv
    BEFORE INSERT OR UPDATE
    ON themes
    FOR EACH ROW
EXECUTE PROCEDURE
    pack_and_theme_tsv_trigger();

-- themes_tsv_tags
DROP INDEX IF EXISTS themes_tsv_tags_index;
CREATE INDEX themes_tsv_tags_index ON themes
    USING gin (tsv_tags);

DROP TRIGGER IF EXISTS themes_tsv_tags ON theme_tags;
CREATE TRIGGER themes_tsv_tags
    AFTER INSERT OR UPDATE OR DELETE
    ON theme_tags
    FOR EACH ROW
EXECUTE PROCEDURE
    theme_tsv_tags_trigger();

-- layouts_tsv
DROP INDEX IF EXISTS layouts_tsv_index;
CREATE INDEX layouts_tsv_index ON layouts
    USING gin (tsv);

DROP TRIGGER IF EXISTS layouts_tsv ON layouts;
CREATE TRIGGER layouts_tsv
    BEFORE INSERT OR UPDATE
    ON layouts
    FOR EACH ROW
EXECUTE PROCEDURE
    layout_tsv_trigger();

---- pack dl_count
CREATE FUNCTION pack_dl_count_updater() RETURNS TRIGGER AS
$$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE packs
        SET dl_count = dl_count + 1
        WHERE id = NEW.pack_id;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE packs
        SET dl_count = dl_count - 1
        WHERE id = OLD.pack_id;

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
EXECUTE PROCEDURE pack_dl_count_updater();

-- TRUNCATE triggers must be FOR EACH STATEMENT
CREATE TRIGGER pack_dlcount_trunc
    AFTER TRUNCATE
    ON pack_downloads
    FOR EACH STATEMENT
EXECUTE PROCEDURE pack_dl_count_updater();

---- theme dl_count
CREATE FUNCTION theme_dl_count_updater() RETURNS TRIGGER AS
$$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE themes
        SET dl_count = dl_count + 1
        WHERE id = NEW.theme_id;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE themes
        SET dl_count = dl_count - 1
        WHERE id = OLD.theme_id;

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
EXECUTE PROCEDURE theme_dl_count_updater();

-- TRUNCATE triggers must be FOR EACH STATEMENT
CREATE TRIGGER theme_dlcount_trunc
    AFTER TRUNCATE
    ON theme_downloads
    FOR EACH STATEMENT
EXECUTE PROCEDURE theme_dl_count_updater();

---- layout dl_count
CREATE FUNCTION layout_dl_count_updater() RETURNS TRIGGER AS
$$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE layouts
        SET dl_count = dl_count + 1
        WHERE id = NEW.layout_id;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE layouts
        SET dl_count = dl_count - 1
        WHERE id = OLD.layout_id;

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
EXECUTE PROCEDURE layout_dl_count_updater();

-- TRUNCATE triggers must be FOR EACH STATEMENT
CREATE TRIGGER layout_dlcount_trunc
    AFTER TRUNCATE
    ON layout_downloads
    FOR EACH STATEMENT
EXECUTE PROCEDURE layout_dl_count_updater();

-- After a single theme is left, remove the pack
CREATE FUNCTION pack_auto_delete() RETURNS TRIGGER AS
$$
DECLARE
    one_left BOOLEAN;
BEGIN
    -- check if now there is only one item left in the pack
    SELECT count(*) = 1
    INTO one_left
    FROM themes
    WHERE id = new.pack_id;

    -- if this is indeed the case, remove pack reference, and pack itself
    IF one_left THEN
        UPDATE packs
        SET pack_id = NULL
        WHERE id = new.pack_id;

        DELETE
        FROM packs
        WHERE id = new.pack_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER theme_delete_pack_auto_delete
    AFTER DELETE
    ON themes
    FOR EACH STATEMENT
EXECUTE PROCEDURE pack_auto_delete();

-- After a single theme is left, remove the pack
CREATE FUNCTION pack_auto_is_nsfw() RETURNS TRIGGER AS
$$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE packs
        SET is_nsfw = is_pack_nsfw(NEW.pack_id)
        WHERE id = NEW.pack_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE packs
        SET is_nsfw = is_pack_nsfw(OLD.pack_id)
        WHERE id = OLD.pack_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER theme_change_pack_auto_is_nsfw
    AFTER INSERT OR UPDATE OR DELETE
    ON themes
    FOR EACH STATEMENT
EXECUTE PROCEDURE pack_auto_is_nsfw();
