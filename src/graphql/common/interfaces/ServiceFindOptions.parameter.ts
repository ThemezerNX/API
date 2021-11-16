import {GraphQLResolveInfo} from "graphql";

// TODO: make this more recursive
export interface ServiceFindOptionsParameter<Entity> {
    info?: GraphQLResolveInfo;
    rootField?: string;
    relations?: Nested<Entity>;
}

type Nested<Entity> = {
    [K in keyof Entity]?:
    (Entity[K] extends Array<infer U>
        ? Nested<U>
        : (keyof Entity[K])[])
    | Nested<Entity[K]>
    | true
}