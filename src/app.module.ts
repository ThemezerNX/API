import {Module} from "@nestjs/common";
import {RestModule} from "./rest/rest.module";
import {GqlModule} from "./gql/gql.module";

@Module({
    imports: [
        RestModule,
        GqlModule,
    ],
})
export class AppModule {
}
