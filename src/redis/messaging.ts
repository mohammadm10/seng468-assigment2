import client from './client';

//Function to subscribe to a channel
export const subscribeToChannel = (channel: string, callback: (message: string) => void) => {
    //Subscribe to the specified channel and log a message to the console
    client.subscribe(channel, () => {
        console.log(`Subscribed to channel ${channel}`);
    });
    //Listen for messages on any channel
    client.on('message', (receivedChannel, message) => {
        //If the message was received on the subscribed channel, call the callback function with the message
        if (channel === receivedChannel) {
            callback(message);
        }
    });
};

//Function to publish a message to a channel
export const publishToChannel = (channel: string, message: string) => {
    //Publish the message to the specified channel
    client.publish(channel, message);
};
