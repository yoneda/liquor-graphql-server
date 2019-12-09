const express = require("express");
const { ApolloServer } = require("apollo-server-express");

const typeDefs = `
  enum DrinkCategory{
    COCKTAIL
    COFFEE
    BEER
    OTHER
  }
  type Query{
    total: Int!
    all: [Drink!]!
  }
  type Drink{
    id: ID!
    name: String!
    url: String!
    category: DrinkCategory
    ingredients: String
    instructions: String
    date: String
  }
`;

const drinks = [
  {
    id: "1",
    name: "飲み物1",
    url: "http://google.com",
    category: "COCKTAIL",
    ingredients: "材料材料",
    instructions: "手順手順",
    date: "2019/10/10 10:00:00"
  },
  {
    id: "2",
    name: "飲み物2",
    url: "http://google.com",
    category: "COCKTAIL",
    ingredients: "材料材料",
    instructions: "手順手順",
    date: "2019/10/10 10:00:00"
  },
  {
    id: "3",
    name: "飲み物3",
    url: "http://google.com",
    category: "BEER",
    ingredients: "材料材料",
    instructions: "手順手順",
    date: "2019/10/10 10:00:00"
  }
];

const resolvers = {
  Query: {
    total: () => drinks.length,
    all: () => drinks
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();

server.applyMiddleware({ app });

app.listen({ port: 3000 }, () =>
  console.log(`server ready at http://localhost:3000${server.graphqlPath}`)
);
