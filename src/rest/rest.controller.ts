import {Controller, Get} from "@nestjs/common";

@Controller("cdn")
export class RestController {

    @Get()
    getHello(): string {
        return "No frii gaems here";
    }

}
