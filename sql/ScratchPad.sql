CREATE TABLE main
(
    internal_id SERIAL,
    computed    VARCHAR GENERATED ALWAYS AS ( LPAD(
            ('x' || SUBSTR(MD5(internal_id::VARCHAR), 1, 16))::BIT(63)::BIGINT::VARCHAR,
            19, '0')) STORED,

    PRIMARY KEY (internal_id),
    UNIQUE (computed)
);

CREATE TABLE third
(
    internal_id SERIAL,
    computed    VARCHAR GENERATED ALWAYS AS (to_hex(internal_id)) STORED not null,

    PRIMARY KEY (internal_id),
    UNIQUE (computed)
);

insert into third (internal_id)
VALUES (13)

CREATE TABLE second
(
    id    VARCHAR REFERENCES main (computed),
    value INT
);

insert into second (value)
values (54)

INSERT INTO main (value)
VALUES (2);

SELECT *
FROM main

SELECT *
FROM second

SELECT *
FROM third