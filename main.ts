import { MongoClient } from 'mongodb'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";
import type { Restaurant } from "./types.ts";

// MIGUEL OLIVER CASCALES

const MONGO_URL = Deno.env.get('MONGO_URL')
if(!MONGO_URL){
  throw new Error('Bad mongo url. . .')
}

const client = new MongoClient(MONGO_URL)
await client.connect()

const db_name = 'ordinariaAPSI_25'
const db = client.db(db_name)

const restaurantsCollection = db.collection<Restaurant>('restaurants')

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {context: async() => ({ restaurantsCollection })});
console.log(`🚀 Server ready at ${url}`);