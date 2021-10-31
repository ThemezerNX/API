import {GraphQLResolveInfo} from "graphql";
import {PreviewsEntityInterface} from "./Previews.entity.interface";
import {AssetsEntityInterface} from "./Assets.entity.interface";

export interface ServiceFindOptionsParameter<Entity, PreviewsEntity extends PreviewsEntityInterface = any, AssetsEntity extends AssetsEntityInterface = any> {
    info?: GraphQLResolveInfo;
    relations?: string[];
    selectPreviews?: (keyof PreviewsEntity)[];
    selectAssets?: (keyof AssetsEntity)[];
}