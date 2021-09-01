import {Module} from "@nestjs/common";
import {RestModule} from "./rest/rest.module";
import {GraphqlModule} from "./graphql/graphql.module";


@Module({
    imports: [
        RestModule,
        GraphqlModule,
    ],
})
export class AppModule {
}
