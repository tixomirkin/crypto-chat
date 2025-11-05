import {
    TEvent,
    TEventGetChat, TEventChat,
    TEventGetEncryptedMessages, TEventEncryptedMessages, TEventNewMessage, TEncryptedMessage, TEventSetKey,
    TEventConnect, TEventChangeUser, TEventSetAdmin, TEventSendMessage
} from "@/store/types";
import PartySocket from "partysocket";
import {useChatStore} from "@/store/chat.ts";
import { decryptMessage, encryptChatKey, encryptMessage, generateChatKey} from "@/lib/crypto.ts";
// import usePartySocket from "partysocket/react";
// import {GameStore} from "@/store/game.ts";


export class SocketController {
    // chatStore: useChatStore
    socket: PartySocket;

    constructor(room: string) {
        const myId = localStorage.getItem("socket_id");
        console.log("eeeee2")

        this.socket = new PartySocket({
            host: import.meta.env.VITE_PARTY_KIT_DOMAIN,
            room: room,
            id: myId ? myId : undefined,
        })

        // useChatStore.setState({
        //     socket_id: this.socket.id,
        //     room_id: room,
        // })

        this.sendGetChat()

        // this.socket.addEventListener("connect", () => this.gameStore.setMyId(this.socket.id))
        this.socket.addEventListener('message', (event: MessageEvent) => this.onMessage(event))


        localStorage.setItem("socket_id", this.socket.id);
    }

    async onMessage(e: MessageEvent) {
        const event = JSON.parse(e.data) as TEvent

        if (event.type == 'chat') {
            this.onGetChat(event)
        }
        else if (event.type == 'encrypted_messages') {
            await this.onGetEncryptedMessages(event)
        }
        else if (event.type == 'new_message') {
            this.onNewMessage(event)
        }
        else if (event.type == 'set_admin') {
            this.onSetAdmin(event)
            console.log(event)
            console.log(useChatStore.getState().admin_id)
        }
        else if (event.type == 'set_key') {
            this.onSetKey(event)
        }
        else if (event.type == 'change_user') {
            this.onChangeUser(event)
        }

    }

    async sendSetKey(passwoed: string) {
        const newKey = await generateChatKey()
        const event: TEventSetKey = {
           type: "set_key",
           encrypted_key: await encryptChatKey(newKey, passwoed)
        }
        this.socket.send(JSON.stringify(event))
        // console.log(newKey)
        useChatStore.getState().setKey(newKey)
    }

    sendGetChat() {
        const event: TEventGetChat = {
            type: 'get_chat'
        }
        this.socket.send(JSON.stringify(event))
    }

    sendGetEncryptedMessages() {
        const event: TEventGetEncryptedMessages = {
            type: 'get_encrypted_messages',
        }
        this.socket.send(JSON.stringify(event))
    }

    sendChangeUser(newNickname: string, newColor: string) {
        const event: TEventChangeUser = {
            type: "change_user",
            user: {
                id: this.socket.id,
                nickname: newNickname,
                color: newColor
            }
        }

        useChatStore.getState().updateProfile(newNickname, newColor)

        this.socket.send(JSON.stringify(event))
    }

    async sendMessage(message: string) {
        const key = useChatStore.getState().key

        if (key) {
            const encryptedMessage: TEncryptedMessage = {
                from_id: this.socket.id,
                encrypted_message: await encryptMessage(message, key),
                timestamp: Number(new Date())
            }
            const event: TEventSendMessage = {
                type: "send_message",
                message: encryptedMessage,
            }
            this.socket.send(JSON.stringify(event))
        }
    }

    onGetChat(event: TEventChat) {
        console.log(event)
        useChatStore.getState().setChat(event.chat)
    }

    onSetAdmin(event: TEventSetAdmin) {
        useChatStore.getState().setAdminId(event.id)
    }

    async onGetEncryptedMessages(event: TEventEncryptedMessages) {
        const key = useChatStore.getState().key
        if (key != null) {
            // TODO: Переписать
            useChatStore.getState().loadMessage(await Promise.all(event.encrypted_messages.map(async (msg) => ({
                    message: await decryptMessage(msg.encrypted_message, key),
                    from_id: msg.from_id,
                    timestamp:  new Date(msg.timestamp * 1000)
                })))
            )
        }
    }

    async onNewMessage(event: TEventNewMessage) {
        const key = useChatStore.getState().key
        if (key != null) {
            useChatStore.getState().addMessage(
                {
                    from_id: event.message.from_id,
                    timestamp: new Date(event.message.timestamp * 1000),
                    message: await decryptMessage(event.message.encrypted_message, key)
                }
            )
        }
    }

    onConnect(event: TEventConnect) {
        useChatStore.getState().addUser({
            id: event.id,
            nickname: '',
            color: ''
        })
    }

    onChangeUser(event: TEventChangeUser) {
        useChatStore.getState().updateUser(event.user);
    }

    onSetKey(event: TEventSetKey) {
        useChatStore.getState().setEncryptKey(event.encrypted_key)
    }

}