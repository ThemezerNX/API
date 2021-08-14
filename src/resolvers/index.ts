import {StubResolver} from "./Stub";
import {NonEmptyArray} from "type-graphql";

const resolvers: NonEmptyArray<Function> | NonEmptyArray<string> = [
    StubResolver,
];

export default resolvers;