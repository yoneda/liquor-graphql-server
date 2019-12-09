const express = require("express");
const { ApolloServer } = require("apollo-server-express");

const typeDefs = `
  type Query{
    total: Int!
  }
`;

const resolvers = {
  Query: {
    total: () => 10
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();

server.applyMiddleware({ app });

app.listen({ port: 3000 }, () =>
  console.log(`server ready at http://localhost:3000${server.graphqlPath}`)
);
