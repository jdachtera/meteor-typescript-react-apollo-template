import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import "./graph";
import { getSchema } from "graphql-load";
import { ApolloServer } from "apollo-server-express";
import { upsertUser } from "./graph";
import createSwitchboard from 'rtc-switchboard';
import http from 'http'

const { typeDefs, resolvers } = getSchema();

const server = new ApolloServer({
    introspection: Meteor.isDevelopment,
    debug: Meteor.isDevelopment,
    typeDefs,
    resolvers,
    context: data => {
        let userId;
        if (data.req) {
            userId = data.req.headers.authorization;
        } else if (data.connection) {
            userId = data.connection.authorization;
        }

        if (userId) {
            upsertUser({ id: userId });
        }
        return { userId };
    },
    subscriptions: {
        onConnect: async (connectionParams, webSocket, context) => {        
            const id = connectionParams?.authorization;
            webSocket.userId = id
            await new Promise(resolve =>setTimeout(resolve, 2000));
            upsertUser({ id, isOnline: true });
        },
        onDisconnect: async (webSocket, context) => {        
            const id = webSocket.userId;
            upsertUser({ id, isOnline: false });
            
        },
    },
});

server.applyMiddleware({
    app: <any>WebApp.connectHandlers,
});
server.installSubscriptionHandlers(WebApp.httpServer);



var switchboardServer = http.createServer();
const switchboard = createSwitchboard(switchboardServer);

switchboard.on('data', function(data, peerId, spark) {
    console.log({ peer: peerId }, 'received: ' + data);
    
});

switchboardServer.listen(parseInt(new URL(process.env.ROOT_URL).port, 10)  + 1)
