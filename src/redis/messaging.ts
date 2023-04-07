import client from './client';

//Function to subscribe to a channel
export const subscribeToChannel = (clientId: string, channel: string, callback: (message: string) => void) => {
    console.log(`Subscribing client ${clientId} to channel ${channel}`);
    client.subscribe(channel, () => { 
        console.log(`Client ${clientId} subscribed to channel ${channel}`);
    });
    client.on('message', (receivedChannel, message) => {
        console.log(`Received message on channel ${receivedChannel}: ${message}`);
        if (channel === receivedChannel) {
            console.log(`Calling callback for client ${clientId}`);
            callback(message);
        }
    });
};


//Function to publish a message to a channel
export const publishToChannel = (channel: string, message: string) => {
    //Publish the message to the specified channel
    try{
        client.publish(channel, message);
    }catch{
        console.log("Couldn't send message");
    }
    console.log(`Sent message ${message} to channel ${channel}`);
};
