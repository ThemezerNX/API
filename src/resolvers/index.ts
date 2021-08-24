import {StubResolver} from "./Stub";
import {NonEmptyArray} from "type-graphql";
import {UserResolver} from "./user/UserResolver";
import {ThemeList} from "./Themes/ThemeList";

const resolvers: NonEmptyArray<Function> | NonEmptyArray<string> = [
    StubResolver,
    UserResolver,
    ThemeList,
];

export default resolvers;