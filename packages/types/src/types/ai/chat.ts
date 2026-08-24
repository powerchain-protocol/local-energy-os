export type ChatRole="user"|"assistant"|"system";
export type ChatMessage={id:string;chatId:string;userId:string;role:ChatRole;content:string;createdAt:string;status?:"pending"|"complete"|"error"};
export type Chat={id:string;userId:string;title:string;modelId:string;createdAt:string;updatedAt:string;messages:ChatMessage[]};
