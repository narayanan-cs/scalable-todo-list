
import IgniteClient  from 'apache-ignite-client';
import Todo from '../models/Todo';
require('dotenv').config(); // Load environment variable
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
const ObjectType = IgniteClient.ObjectType;

let cache: any

const igniteClient = new IgniteClient(onStateChanged);

async function connect() {

        await igniteClient.connect(new IgniteClientConfiguration('127.0.0.1:10800'));

        console.log('Connected to Ignite server');
       // cache = await igniteClient.getOrCreateCache<string, any>('todosCache')
         cache = await igniteClient.getOrCreateCache('todosCache')
            
    }

function onStateChanged(state : any, reason: any) {
    if (state === IgniteClient.STATE.CONNECTED) {
        console.log('Client is started');
    }
    else if (state === IgniteClient.STATE.DISCONNECTED) {
        console.log('Client is stopped');
        if (reason) {
            console.log(reason);
        }
    }
}
export const getCache = async () => {
 
   if (!cache) {
        await connect(); // Ensure connection and cache initialization
    }
    return cache;
};

