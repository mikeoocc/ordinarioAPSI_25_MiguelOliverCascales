import { GraphQLError } from "graphql";
import type { Restaurant } from "./types.ts";
import { ObjectId, type Collection } from "mongodb";

//327993

export const resolvers = {
    Restaurant: {
        _id: (parent: Restaurant) => {
            return parent._id
        },
        nombre: (parent: Restaurant) => {
            return parent.nombre
        },
        direccion: (parent: Restaurant) => {
            return parent.direccion + ", " + parent.ciudad + ", " + parent.pais
        },
        telefono: (parent: Restaurant) => {
            return parent.telefono
        },
        temperatura: async (parent: Restaurant) => {
            const API_KEY = Deno.env.get('API_KEY')
            if(!API_KEY) throw new Error('Bad API key. . .')

            const url = 'https://api.api-ninjas.com/v1/city?name=' + parent.ciudad
            const response = await fetch(url, {
                headers: {
                    'X-Api-Key': API_KEY,
                },
            })

            if(response.status != 200) throw new GraphQLError('Error de API al usar la ciuad')
            const data = await response.json()

            const lat = data[0].latitude.toString()
            const lon = data[0].longitude.toString()

            const urlWeather = 'https://api.api-ninjas.com/v1/weather?lat=' + lat + '&&lon=' + lon
            const responseWeather = await fetch(urlWeather, {
                headers: {
                    'X-Api-Key': API_KEY,
                },
            })

            if(responseWeather.status != 200) throw new GraphQLError('Error de API al usar la latitud y longitud')
            const dataWeather = await responseWeather.json()

            const temperatura = dataWeather.temp.toString()
            return temperatura

        },
        hora: async (parent: Restaurant) => {

            const API_KEY = Deno.env.get('API_KEY')
            if(!API_KEY) throw new Error('Bad API key. . .')

            const url = 'https://api.api-ninjas.com/v1/worldtime?timezone=' + parent.timezone

            const response = await fetch(url, {
                headers: {
                    'X-Api-Key': API_KEY,
                },
            })

            if(response.status != 200) throw new GraphQLError('Error de API al usar el timezone')
            const data = await response.json()

            const hora = data.hour.toString()
            const minutos = data.minute.toString()
            return hora+':'+minutos

        }
    },

    Query: {
        getRestaurant: async (
            _: unknown,
            args: { _id: string },
            ctx: { restaurantsCollection: Collection<Restaurant>}
        ): Promise<Restaurant> => {
            const restaurante = await ctx.restaurantsCollection.findOne({_id: new ObjectId(args._id)})
            if(!restaurante){
                throw new Error('El restaurante no existe. . .')
            }
            return restaurante
        },
        getRestaurants: async (
            _:unknown,
            args: {ciudad: string},
            ctx: {restaurantsCollection: Collection<Restaurant>}
        ): Promise<Restaurant[]> => {
            const existe = await ctx.restaurantsCollection.find({ciudad: args.ciudad}).toArray()
            if(!existe || existe.length == 0){
                throw new Error('Esa ciudad no existe o no hay restaurantes en ella. . .')
            }
            const restaurants = await ctx.restaurantsCollection.find({ciudad: args.ciudad}).toArray()
            return restaurants
        }
    },

    Mutation: {
        addRestaurant: async (
            _: unknown,
            args: {nombre: string, direccion: string, ciudad: string, telefono: string},
            ctx: { restaurantsCollection: Collection<Restaurant> }
        ): Promise<Restaurant> => {
            if(!args.nombre || !args.direccion || !args.ciudad || !args.telefono){
                throw new Error('Error, faltan datos para añadir un restaurante')
            }

            const API_KEY = Deno.env.get('API_KEY')
            if(!API_KEY) throw new Error('Bad API key. . .')

            const url = 'https://api.api-ninjas.com/v1/validatephone?number=' + args.telefono

            const response = await fetch(url, {
                headers: {
                    'X-Api-Key': API_KEY,
                },
            })

            if(response.status != 200) throw new GraphQLError('Error de API al validar telefono')
            const data = await response.json()

            const existe = await ctx.restaurantsCollection.findOne({telefono: args.telefono})
            if(existe){
                throw new Error('Error, este telefono ya existe')
            }

            const pais = data.country.toString()
            const timezone = data.timezones[0].toString()

            const { insertedId } = await ctx.restaurantsCollection.insertOne({
                nombre: args.nombre,
                direccion: args.direccion,
                ciudad: args.ciudad,
                telefono: args.telefono,
                pais: pais,
                timezone: timezone
            })

            return {
                _id: insertedId,
                nombre: args.nombre,
                direccion: args.direccion,
                ciudad: args.ciudad,
                telefono: args.telefono,
                pais: pais,
                timezone: timezone
            }

        },
        deleteRestaurant: async (
            _: unknown,
            args: { _id: string },
            ctx: { restaurantsCollection: Collection<Restaurant> }
        ): Promise<boolean> => {
            const existe = await ctx.restaurantsCollection.find({_id: new ObjectId(args._id)})
            if(!existe){
                return false
            }
            await ctx.restaurantsCollection.deleteOne({_id: new ObjectId(args._id)})
            return true
        }
    }
}