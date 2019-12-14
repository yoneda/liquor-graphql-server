const express = require("express");
const request = require("superagent");
const { ApolloServer } = require("apollo-server-express");
const dotenv = require("dotenv");
dotenv.config();

// APIリクエストを送信するためのエージェント
const agentUrl = process.env.RAPIDAPI_URL;
const rapidApiHost = process.env.RAPIDAPI_HOST;
const rapidApiKey = process.env.RAPIDAPI_KEY;

const categoryToLoose = category =>
  ({
    COCKTAIL: "Cocktail",
    OTHER: "Other/Unknown",
    COFFEE: "Coffee / Tea",
    BEER: "Beer"
  }[category]);

const categoryToStrict = category =>
  ({
    Cocktail: "COCKTAIL",
    "Other/Unknown": "OTHER",
    "Coffee / Tea": "COFFEE",
    Beer: "BEER"
  }[category]);

const DrinkAgent = {
  all: category =>
    request
      .get(`${agentUrl}/filter.php`)
      .query({
        c: categoryToLoose(category)
      })
      .set("X-RapidAPI-Host", rapidApiHost)
      .set("X-RapidAPI-Key", rapidApiKey)
      .then(res =>
        res.body.drinks.map(drink => {
          const obj = {
            id: parseInt(drink["idDrink"]),
            name: drink["strDrink"],
            url: drink["strDrinkThumb"]
          };
          return obj;
        })
      ),
  oneById: id =>
    request
      .get(`${agentUrl}/lookup.php`)
      .query({
        i: `${id}`
      })
      .set("X-RapidAPI-Host", rapidApiHost)
      .set("X-RapidAPI-Key", rapidApiKey)
      .then(res => {
        console.log(res.body);
        const drink = res.body.drinks[0];
        return {
          id: parseInt(drink["idDrink"]),
          name: drink["strDrink"],
          url: drink["strDrinkThumb"],
          category: categoryToStrict(drink["strCategory"]),
          instructions: drink["strInstructions"]
        };
      })
};

// GraphQL のスキーマ定義
const typeDefs = `
  enum DrinkCategory{
    COCKTAIL
    COFFEE
    BEER
    OTHER
  }
  type Query{
    total: Int!
    allDrinks(category: DrinkCategory): [Drink!]!
    Drink(id: ID!): Drink!
    walkup: String!
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

// GraphQL のリゾルバ
const resolvers = {
  Query: {
    allDrinks: (parent, { category }) => DrinkAgent.all(category),
    Drink: (parent, { id }) => DrinkAgent.oneById(id),
    walkup: () => "hello",
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();

server.applyMiddleware({ app });

app.listen({ port: process.env.PORT || 4000 }, () =>{
  const port = process.env.PORT || 4000;
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
});
