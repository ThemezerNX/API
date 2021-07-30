---------------------------------------------------------------------------------------
-- FUNCTIONS --------------------------------------------------------------------------
---------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION int_to_userid(INT) RETURNS VARCHAR AS
$$
BEGIN
    RETURN LPAD(('x' || SUBSTR(MD5($1::VARCHAR), 1, 16))::BIT(63)::BIGINT::VARCHAR, 19, '0');
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION int_to_userid IS 'Convert int to the userid format';

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
            * (PG_RELATION_SIZE(table_name) / CURRENT_SETTING('block_size')::INT)
                   )::INT
        FROM pg_class
        WHERE oid = table_name::regclass
    );
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION int_to_userid IS 'Returns an approximate row count for a table. Often not more than 10% off';