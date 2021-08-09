CREATE TABLE main
(
    internal_id SERIAL,
    computed    VARCHAR GENERATED ALWAYS AS ( LPAD(
            ('x' || SUBSTR(MD5(internal_id::VARCHAR), 1, 16))::BIT(63)::BIGINT::VARCHAR,
            19, '0')) STORED,

    PRIMARY KEY (computed)
);

CREATE TABLE third
(
    internal_id SERIAL,
    computed    VARCHAR GENERATED ALWAYS AS (TO_HEX(internal_id)) STORED NOT NULL,

    PRIMARY KEY (internal_id),
    UNIQUE (computed)
);

INSERT INTO third (internal_id)
VALUES (13)

CREATE TABLE test2
(
    id VARCHAR PRIMARY KEY
);

INSERT INTO second (value)
VALUES (54)

INSERT INTO main (value)
VALUES (2);

SELECT *
FROM main

SELECT *
FROM second

SELECT *
FROM third


SELECT LPAD(
               ('x' || SUBSTR(MD5(9::VARCHAR), 1, 16))::BIT(63)::BIGINT::VARCHAR,
               19, '0');

SELECT ARRAY_TO_STRING('{test, fine, ok}'::VARCHAR[], ' ');

CREATE TABLE test
(
    id VARCHAR PRIMARY KEY
);

CREATE TABLE test2
(
    id    VARCHAR,
    value BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (id) REFERENCES test (id)
);


SELECT COUNT(*) > 0
FROM test,
     test2
WHERE test2.id = test.id
  AND test.id = '1'
  AND value = TRUE

-- Create array of all tags for a theme
CREATE OR REPLACE FUNCTION is_test(id VARCHAR) RETURNS BOOLEAN AS
$$
BEGIN
    RETURN (
        SELECT COUNT(*) > 0
        FROM test,
             test2
        WHERE test2.id = test.id
          AND test.id = is_test.id
          AND value = TRUE
    );
END;
$$ LANGUAGE plpgsql;

SELECT is_test('1')
           execute;

ALTER TABLE layout_options
    ADD COLUMN "order" INT NOT NULL