import redis from 'redis';

const url = process.env.REDIS_URL || 'redis://localhost:6379';

//set up redis client
const client = redis.createClient({
    url
});

client.on('error', (err) => {
  console.error(err);
});

export default client;