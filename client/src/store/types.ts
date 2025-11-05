import {TCrypt} from "@/lib/crypto.ts";

export type TUser = {
    id: string;
    nickname: string,
    color: string
}

export type TEncryptedMessage = {
    from_id: string;
    // from_nickname: string;
    encrypted_message: TCrypt;
    timestamp: number;
}

export type TMessage = {
    from_id: string;
    message: string;
    timestamp: Date;
}

export type TChat = {
    online_count: number;
    admin_id: string;
    encrypted_key: string;
    // key_timestamp: number;
    users: TUser[];
}

export type TEventGetEncryptedMessages = {
    type: 'get_encrypted_messages';
}

export type TEventEncryptedMessages = {
    type: 'encrypted_messages';
    encrypted_messages: TEncryptedMessage[];
}

export type TEventGetChat = {
    type: 'get_chat',
}

export type TEventChangeUser = {
    type: 'change_user';
    user: TUser
}

export type TEventChat = {
    type: 'chat',
    chat: TChat
}

export type TEventSetKey = {
    type: 'set_key',
    encrypted_key: string
}

export type TEventSetAdmin = {
    type: 'set_admin';
    id: string;
}

export type TEventNewMessage = {
    type: 'new_message',
    message: TEncryptedMessage
}

export type TEventSendMessage = {
    type: 'send_message',
    message: TEncryptedMessage
}

export type TEventConnect = {
    type: 'connect',
    id: string,
}

export type TEventLeave = {
    type: 'leave',
    id: string,
}


export type TEvent =  TEventLeave | TEventSendMessage | TEventSetAdmin | TEventConnect | TEventChat | TEventGetChat | TEventNewMessage | TEventSetKey | TEventEncryptedMessages | TEventGetEncryptedMessages | TEventChangeUser

