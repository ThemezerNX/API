import {Arg, Query, Resolver} from "type-graphql";


@Resolver()
export class StubResolver {

    @Query()
    stub(@Arg("name") name: string): string {
        return name;
    }

}