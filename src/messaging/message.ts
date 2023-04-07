import { subscribeToChannel, publishToChannel } from "../redis/messaging";
import { ObjectId } from "mongodb";

export async function sendMessage(sender: ObjectId, recipient: ObjectId, message: string){
    const channel = `message_${sender.toString()}_${recipient.toString()}`;
    await subscribeToChannel(sender.toString(), channel, async () => {
        await publishToChannel(channel, message);
    });
}

export async function getMessage(clientId: ObjectId, channel: string){
    console.log('going to get message..');
    
    await subscribeToChannel(clientId.toString(), channel, (message) => {
        console.log(message);
      });
}