import {Module} from "@nestjs/common";
import {RestController} from "./rest.controller";
import {RestService} from "./rest.service";
import {ResourcesModule} from "./resources/resources.module";

@Module({
    imports: [
        ResourcesModule
    ],
    controllers: [RestController],
    providers: [RestService],
})
export class RestModule {
}
