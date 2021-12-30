import {ReturningResultsEntityUpdator} from "typeorm/query-builder/ReturningResultsEntityUpdator";
import {ColumnMetadata} from "typeorm/metadata/ColumnMetadata";


ReturningResultsEntityUpdator.prototype.getInsertionReturningColumns = function(): ColumnMetadata[] {
    const needToCheckGenerated = this.queryRunner.connection.driver.isReturningSqlSupported();

    return this.expressionMap.mainAlias!.metadata.columns.filter(column => {
        return  column.default !== undefined ||
            (needToCheckGenerated &&
                column.isGenerated ||
                !!column.asExpression
            ) ||
            column.isCreateDate ||
            column.isUpdateDate ||
            column.isDeleteDate ||
            column.isVersion;
    });
}