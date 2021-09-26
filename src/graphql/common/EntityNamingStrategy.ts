import {DefaultNamingStrategy, NamingStrategyInterface, Table} from "typeorm";
import {snakeCase} from "typeorm/util/StringUtils";
import {customAlphabet} from "nanoid";

const ALIAS_LENGTH = 10;

/**
 * Entity naming strategy that removes the 'Entity' suffixes.
 */
export class EntityNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {

    /**
     * Trim the 'Entity' suffix of a string.
     *
     * @param input The input string
     */
    trimEntity(input: Table | string): string {
        const name = input instanceof Table ? input.name : input;
        return snakeCase(name).split("_").length > 1 ? name.replace(/Entity$/, "") : name;
    }

    tableName(targetName: string, userSpecifiedName: string | undefined): string {
        return super.tableName(this.trimEntity(targetName), userSpecifiedName);
    }

    private _aliasCache: { [key: string]: string } = {};

    // https://github.com/typeorm/typeorm/issues/3118#issuecomment-854998821
    eagerJoinRelationAlias(alias: string, propertyPath: string): string {

        const key = `${alias}:${propertyPath}`;

        if (this._aliasCache[key]) return this._aliasCache[key];

        const orig = super.eagerJoinRelationAlias(alias, propertyPath);
        const characters = orig.replace(/_/g, "").toUpperCase();
        const nanoid = customAlphabet(characters, ALIAS_LENGTH);
        const out = nanoid();

        this._aliasCache[key] = out;
        return out;
    }

}