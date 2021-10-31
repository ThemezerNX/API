import {BaseEntity, SelectQueryBuilder} from "typeorm";
import {PreviewsEntityInterface} from "../interfaces/Previews.entity.interface";
import {AssetsEntityInterface} from "../interfaces/Assets.entity.interface";
import {ServiceFindOptionsParameter} from "../interfaces/ServiceFindOptions.parameter";
import {EntityWithPreviewsInterface} from "../interfaces/EntityWithPreviews.interface";
import {EntityWithAssetsInterface} from "../interfaces/EntityWithAssets.interface";

/**
 * Select a preview file: EntityWithPreviewsInterface.previews.<file>
 * This will add the "previews" relation to the relations list, so make sure to run joinAndSelectRelations after this!
 *
 * @param qb
 * @param options
 */
export function selectPreviews<QT, ET extends EntityWithPreviewsInterface, PT extends PreviewsEntityInterface>(qb: SelectQueryBuilder<QT>, options: ServiceFindOptionsParameter<ET, PT>) {
    if (options?.selectPreviews?.length > 0) {
        const relationProperty = "previews" as keyof EntityWithPreviewsInterface;
        if (!options?.relations) {
            options.relations = [relationProperty];
        } else if (!options?.relations.includes(relationProperty)) {
            options.relations.push(relationProperty);
        }
        qb.addSelect(options.selectPreviews.map((file) => relationProperty + "." + file));
    }
}

/**
 * Select an asset file: EntityWithAssetsInterface.assets.<file>
 * This will add the "previews" relation to the relations list, so make sure to run joinAndSelectRelations after this!
 *
 * @param qb
 * @param options
 */
export function selectAssets<QT, ET extends EntityWithAssetsInterface, AT extends AssetsEntityInterface>(qb: SelectQueryBuilder<QT>, options: ServiceFindOptionsParameter<ET, any, AT>) {
    if (options?.selectAssets?.length > 0) {
        const relationProperty = "assets" as keyof EntityWithAssetsInterface;
        if (!options?.relations) {
            options.relations = [relationProperty];
        } else if (!options?.relations.includes(relationProperty)) {
            options.relations.push(relationProperty);
        }
        qb.addSelect(options.selectAssets.map((file) => relationProperty + "." + file));
    }
}

export function joinAndSelectRelations<QT, ET extends BaseEntity>(qb: SelectQueryBuilder<QT>, options: ServiceFindOptionsParameter<ET, any, any>) {
    for (const relation of (options?.relations || [])) {
        qb.leftJoinAndSelect(qb.alias + "." + relation.toString(), relation.toString());
    }
}