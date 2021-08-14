const gql = require("graphql-tag");

export default gql`
    scalar Upload
    scalar GUID
    scalar DateTime
    scalar HexColorCode
    scalar JSON
    scalar URL
    scalar EmailAddress
    scalar NonEmptyString
    
    enum Target {
        ResidentMenu
        Entrance
        Flaunch
        Set
        Psl
        MyPage
        Notification
        "What to do?"
        HBMenu
    }

    type File {
        filename: String
        data: String!
        mimetype: String
    }

    enum CacheControlScope {
        PUBLIC
        PRIVATE
    }

    directive @cacheControl(
        maxAge: Int
        scope: CacheControlScope
    ) on FIELD_DEFINITION | OBJECT | INTERFACE

    type Pagination {
        page: Int!
        limit: Int
        page_count: Int!
        item_count: Int!
    }

    type User {
        id: ID!
        joinedTimestamp: DateTime!
        hasAccepted: Boolean!
        isBlocked: Boolean!
        isAdmin: Boolean
        roles: [String!]!
        preferences: UserPreferences!
    }

    type PublicUser {
        id: ID!
        joinedTimestamp: DateTime!
        isAdmin: Boolean
        roles: [String!]!
        preferences: UserPreferences!
    }
    
    type UserPreferences {
        email: EmailAddress
        username: String!
        bio: String
        "Gravatar image"
        avatarUrl: URL
        bannerUrl: URL
        color: HexColorCode
        showNSFW: Boolean!
    }

    type DiscordUser {
        id: ID!    
        username: String!
        discriminator: Int!
        "A small resolution profile picture"
        avatarUrl: URL!
    }
    
    type Pack {
        id: ID!
        user: User
    }
    
    type Query {
        
    }
    
    type Mutation {
        
    }

    schema {
        query: Query
        mutation: Mutation
    }
`;
