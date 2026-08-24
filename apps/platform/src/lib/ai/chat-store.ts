import type { Chat, ChatMessage } from "@/types/ai/chat";
const chats=new Map<string,Chat>();
export function listChats(userId:string){return [...chats.values()].filter(c=>c.userId===userId)}
export function getChat(id:string,userId:string){const chat=chats.get(id);return chat?.userId===userId?chat:null}
export function createChat(userId:string,modelId="powerchain-renewables"){const now=new Date().toISOString();const chat:Chat={id:crypto.randomUUID(),userId,title:"New energy analysis",modelId,createdAt:now,updatedAt:now,messages:[]};chats.set(chat.id,chat);return chat}
export function addMessage(chatId:string,userId:string,role:ChatMessage["role"],content:string){const chat=getChat(chatId,userId);if(!chat)throw new Error("Chat not found");const msg:ChatMessage={id:crypto.randomUUID(),chatId,userId,role,content,createdAt:new Date().toISOString(),status:"complete"};chat.messages.push(msg);chat.updatedAt=msg.createdAt;return msg}
