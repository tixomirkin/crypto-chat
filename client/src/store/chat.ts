import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {TChat, TMessage, TUser} from "@/store/types.ts";

type ChatStore = {
    socket_id: string,
    room_id: string,
    key: CryptoKey | null,
    username: string,
    color: string,
    password: string,

    online_count: number;
    admin_id: string;
    encrypted_key: string;

    users: TUser[]
    messages: TMessage[]

    // joinChat: (roomId: string, key: string) => Promise<void>,
    // leaveChat: () => Promise<void>,
    // sendMessage: (message: string) => Promise<void>,
    addMessage: (message: TMessage) => void,
    loadMessage: (messages: TMessage[]) => void,
    setKey: (key: CryptoKey | null) => void,
    setAdminId: (id: string) => void,
    addUser: (user: TUser) => void,
    setUsers: (users: TUser[]) => void,
    updateUser: (user: TUser) => void,
    setChat: (chat: TChat) => void,
    setEncryptKey: (key: string ) => void,
    updateProfile: (username: string , color: string) => void,

    // addABear: () => void
}

export const useChatStore = create<ChatStore>()(
    persist(
        (set) => ({
            socket_id: '',
            room_id: '',
            key: null,
            username: '',
            color: '',
            password: '',

            online_count: 0,
            admin_id: '',
            encrypted_key: '',

            users: [],
            messages: [],
            // addABear: () => set({ bears: get().bears + 1 }),

            // joinChat: async (roomId: string, key: string) => {
            //     return
            // },
            // leaveChat: async () => {
            //     return
            // },
            addMessage: (message: TMessage) => {
                set(state => ({
                    messages: [...state.messages, message],
                }))
            },
            loadMessage: (messages: TMessage[]) => {
                set(() => ({
                    messages: messages,
                }))
            },
            setKey: (key: CryptoKey | null) => {
                set(() => ({
                    key: key,
                }))
            },
            addUser: (user: TUser) => {
                set(state => ({
                    users: [...state.users, user],
                }))
            },
            setUsers: (users: TUser[]) => {
                set(() => ({
                    users: users,
                }))
            },
            setSocketId: (socketId: string) => {
                set(() => ({
                    socket_id: socketId,
                }))
            },
            setAdminId: (id: string) => {
                set(() => ({
                    admin_id: id,
                }))
            },
            updateUser: (newUser: TUser) => {
                set(state => ({
                    users: state.users.map(user => {
                        if (user.id === newUser.id) {
                            return newUser
                        }
                        else return user
                    }),
                }))
            },
            setChat: (chat: TChat) => {
                set(() => ({
                    admin_id: chat.admin_id,
                    online_count: chat.online_count,
                    encrypted_key: chat.encrypted_key,
                    users: chat.users,
                }))
            },
            setEncryptKey: (key: string) => {
                set(() => ({
                    encrypted_key: key,
                }))
            },
            updateProfile: (username: string, color: string) => {
                set(() => ({
                    username: username,
                    color: color,
                }))
            }

        }),
        {
            name: 'chat-storage', // name of the item in the storage (must be unique)
            partialize: (state) => ({
                color: state.color,
                username: state.username,
            })
        },
    ),
)
