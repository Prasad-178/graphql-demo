const { buildSchema } = require("graphql")

module.exports = buildSchema(`
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        verified: Boolean!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    input ModifyUserInputData {
        oldPassword: String!
        newPassword: String!
        name: String!
    }

    type AuthData {
        token: String!
        userId: String!
    }
    
    type RootMutation {
        createUser(userInput: UserInputData): User!
        modifyUser(userInput: ModifyUserInputData): User!
        deleteUser(userInput: String!): User
    }

    type RootQuery {
        getUser(userEmail: String!): User!
        login(email: String!, password: String!): AuthData!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)