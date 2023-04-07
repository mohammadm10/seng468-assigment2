import * as redis from 'redis';

const url = 'redis://localhost:6379';

//set up redis client
const client = redis.createClient({
    url
});

export default client;