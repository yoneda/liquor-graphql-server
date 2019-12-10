const express = require("express");
const request = require("superagent");
const { ApolloServer } = require("apollo-server-express");

// APIリクエストを送信するためのエージェント
const agentUrl = "https://the-cocktail-db.p.rapidapi.com/filter.php";
const rapidApiHost = "the-cocktail-db.p.rapidapi.com";
const rapidApiKey = "8f4a6e1dfdmshb86bcf026befee7p13f8c7jsn390704209ed1";

const DrinkAgent = {
  all: category =>
    request
      .get(agentUrl)
      .query({
        c: {
          COCKTAIL: "Cocktail",
          OTHER: "Other / Unknown",
          COFFEE: "Coffee / Tea",
          BEER: "Beer"
        }[category]
      })
      .set("X-RapidAPI-Host", rapidApiHost)
      .set("X-RapidAPI-Key", rapidApiKey)
      .then(res =>
        res.body.drinks.map(drink => ({
          id: parseInt(drink["idDrink"]),
          name: drink["strDrink"],
          url: drink["strDrinkThumb"]
        }))
      )
};

// デバッグ用
/*
const testFunc = async () => {
  const result = await DrinkAgent.all("COCKTAIL");
  console.log(result);
};

testFunc();
*/

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
    allDrinks: (parent, { category }) => DrinkAgent.all(category)
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`server ready at http://localhost:4000${server.graphqlPath}`)
);
