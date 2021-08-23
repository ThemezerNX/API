import {Query, Resolver} from "type-graphql";


@Resolver()
export class StubResolver {

    @Query()
    stub(): string {
        return "Hello World";
    }

}