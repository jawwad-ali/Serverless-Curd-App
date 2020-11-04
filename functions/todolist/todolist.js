const { ApolloServer, gql } = require('apollo-server-lambda')
const faunadb = require('faunadb'),
  q = faunadb.query;
require('dotenv').config();

const typeDefs = gql`

  type Query {
    todo:[Todo!]
  }
 
  type Mutation {
    addTodo( title:String! , desc:String!) : Todo
    deleteTodo(id: ID!): Todo
  }

  type Todo {
    id: ID!
    title: String!
    desc: String!
  }
`
const resolvers = {
  Query: {
    todo: async (parent, args, context) => {
      try {
        var adminClient = new faunadb.Client({ secret: process.env.FAUNADB_ADMIN_SECRET });
        const result = await adminClient.query(
          q.Map(
            q.Paginate(q.Match(q.Index('dos'))),
            q.Lambda(x => q.Get(x))
          )
        )
        console.log(result.data)

        return result.data.map(d => {
          return {
            id: d.ref.id,
            title: d.data.title,
            desc: d.data.desc
          }
        })
      }
      catch (err) {
        console.log("err==>", err)
      }
    }
  },
  Mutation: {
    addTodo: async (_, {  title, desc }) => {
      console.log("title ", title, "desc", desc)

      try {
        var client = new faunadb.Client({ secret: process.env.FAUNADB_ADMIN_SECRET });
        var result = await client.query(
          q.Create(
            q.Collection('todo'),
            {
              data: {
                title,
                desc
              }
            },
          )
        )
        return result.ref.data
      }
      catch (err) {
        console.log("err=>>", err)
      }
    },

    // delete
    deleteTodo: async (_, { id }) => {
      try {
        var client = new faunadb.Client({ secret: process.env.FAUNADB_ADMIN_SECRET });
        var result = await client.query(
          q.Delete(q.Ref(q.Collection('todo'), id))
        )
        return result.ref.data
      }
      catch (err) {
        console.log("err", err)
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true
})

exports.handler = server.createHandler()
