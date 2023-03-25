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

//Function to add a unique key and its value to cache
export function addToCache(key: string, value: string): void {
  try {
      client.set(key, value);
  } catch (err) {
      console.log(`Error adding key "${key}" with value "${value}" to cache`)
  }
}

//Function to get a value of a specified key
export async function getFromCache(key: string, callback: (value: string | null) => void): Promise<void> {
  try {
      const value = await client.get(key);
      callback(value);
  } catch (err) {
      console.error(`Error fetching value for key "${key}"`);
      callback(null);
  }
}