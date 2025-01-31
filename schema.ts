// La direccion aqui es completa, incluyendo pais y ciudad

export const schema = `#graphql

type Restaurant {
    _id: ID!
    nombre: String!,
    direccion: String!,
    telefono: String!,
    temperatura: String!,
    hora: String!
}

type Query {
    getRestaurant(_id: ID!): Restaurant!
    getRestaurants(ciudad: String!): [Restaurant]!
}

type Mutation {
    addRestaurant(nombre: String!, direccion: String!, ciudad: String!, telefono: String!): Restaurant!
    deleteRestaurant(_id: String!): Boolean!
}

`