import {Module} from "@nestjs/common";
import {RestModule} from "./rest/rest.module";
import {GqlModule} from "./gql/gql.module";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [
        RestModule,
        GqlModule
    ],
})
export class AppModule {
}
