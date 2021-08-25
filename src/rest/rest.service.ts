import {Injectable} from "@nestjs/common";

@Injectable()
export class RestService {

    getHello(): string {
        return "No frii gaems here";
    }

}
