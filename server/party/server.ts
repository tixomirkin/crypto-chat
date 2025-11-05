import type * as Party from "partykit/server";
import type {
    TChat, TEncryptedMessage, TEvent, TEventChangeUser, TEventChat, TEventConnect, TEventEncryptedMessages,
    TEventGetChat,
    TEventGetEncryptedMessages, TEventLeave, TEventNewMessage, TEventSendMessage, TEventSetAdmin, TEventSetKey
} from "./types";


export const headers = {
    'Content-Type': 'application/json',
    // 'Access-Control-Allow-Origin': process.env.CLIENT_DOMAIN || 'http://localhost:5173',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
}


export default class Room implements Party.Server {

  chat: TChat = {
      online_count: 0,
      admin_id: '',
      encrypted_key: '',
      users: [],
  }

  encrypted_messages: TEncryptedMessage[] = []


  constructor(readonly party: Party.Room) {}


  async onRequest(req: Party.Request) {
    if (req.method === "OPTIONS") {
      return new Response(null, {headers: headers});
    }
    else if (req.method === "GET") {
        return new Response(JSON.stringify({a: "a"}), {headers: headers});
    }

    return new Response(JSON.stringify({ status: 400 }), {headers: headers});
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
      const oldUser = this.chat.users.find((u) => u.id == conn.id)
      if (!oldUser) {
          this.chat.users.push({
              id: conn.id,
              nickname: '',
              color: ''
          })
      }


    this.chat.online_count += 1

    if (this.chat.admin_id == '') {
      this.chat.admin_id = conn.id;

      const event: TEventSetAdmin = {
          type: "set_admin",
          id: conn.id,
      }

      this.party.broadcast(JSON.stringify(event))
    }

    const conEvent: TEventConnect = {
      type: "connect",
      id: conn.id,
    }

    this.party.broadcast(JSON.stringify(conEvent))
  }

  onClose(conn: Party.Connection) {

    this.chat.online_count -= 1

    const event: TEventLeave = {
        type: 'leave',
        id: conn.id,
    }

    this.party.broadcast(JSON.stringify(event))
  }

  onMessage(message: string, sender: Party.Connection) {

    const event = JSON.parse(message) as TEvent;

    if (event.type === 'send_message') {
        this.onNewMessage(event, sender)
    }
    else if (event.type === 'get_chat') {
        this.onGetChat(sender)
    }
    else if (event.type === 'set_key') {
        this.onSetKey(event, sender)
    }
    else if (event.type == 'get_encrypted_messages') {
        this.onGetEncryptedMessages(event, sender)
    }
    else if (event.type == 'change_user') {
        this.onChangeUser(event, sender)
    }


  }

  onNewMessage(event: TEventSendMessage, sender: Party.Connection) {
      if (event.message.from_id == sender.id) {
          this.encrypted_messages.push(event.message)


          const new_event: TEventNewMessage = {
              type: "new_message",
              message: event.message,
          }

          this.party.broadcast(JSON.stringify(new_event))

      }

  }

  onGetChat(sender: Party.Connection) {
      const event: TEventChat = {
          type: "chat",
          chat: this.chat
      }
      sender.send(JSON.stringify(event))
  }

  onChangeUser(event: TEventChangeUser, sender: Party.Connection) {
      if (event.user.id == sender.id) {
          const user = this.chat.users.find(user => user.id == sender.id)
          if (user) {
              user.color = event.user.color
              user.nickname = event.user.nickname
              this.party.broadcast(JSON.stringify(event))
          }
      }
  }

  onSetKey(event: TEventSetKey, sender: Party.Connection) {
      if (this.chat.admin_id == sender.id) {
          this.chat.encrypted_key = event.encrypted_key
          this.party.broadcast(JSON.stringify(event))
      }
  }

  onGetEncryptedMessages(event: TEventGetEncryptedMessages, sender: Party.Connection) {
      console.log("sss")
      const newEvent : TEventEncryptedMessages = {
          type: "encrypted_messages",
          encrypted_messages: this.encrypted_messages
      }
      sender.send(JSON.stringify(newEvent))
  }

}

Room satisfies Party.Worker;
