import {SocketController} from "@/store/socket-controller";

import { useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {ModeToggle} from "@/components/mode-toggle.tsx";
import { RefreshCcw, User} from "lucide-react";
import {useChatStore} from "@/store/chat.ts";
import {Input} from "@/components/ui/input.tsx";
import Message from "@/components/Message.tsx";
import ModalProfile from "@/components/ModalProfile.tsx";


export const ChatView =  ({sc}: {sc: SocketController}) => {

    const [openModal, setOpenModal] = useState(false)

    const users = useChatStore(state => state.users)
    const messages = useChatStore(state => state.messages)
    const online_count = useChatStore(state => state.online_count)
    const user = useChatStore.getState().users.find((u) => u.id == sc.socket.id)

    // const gameStore = useContext<GameStore>(GameContext)

    // const spectators = gameStore.players.filter((player) => player.isSpectator)
    // const players = gameStore.players.filter((player) => !player.isSpectator)
    // const me = gameStore.players.find((player) => player.id == sc.socket.id)

    // const [editOpen, setEditOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState("");

    useEffect(() => {
        const username = useChatStore.getState().username;
        const color = useChatStore.getState().color;

        if (username == '') setOpenModal(true)
        else {
            sc.sendChangeUser(username, color)
        }

        // if (!localStorage.getItem("game-name")) setEditOpen(true)
        sc.sendGetEncryptedMessages()
    }, []);

    useEffect(() => {
        const syncInterval = setInterval(() => {
            sc.sendGetEncryptedMessages()
            sc.sendGetChat()
        }, 5000)
        return () => clearInterval(syncInterval)
    }, []);

    async function sendMessage() {
        if (inputMessage == '') return;
        await sc.sendMessage(inputMessage)

        setInputMessage('')
    }



    return (
        <>
            <div className=' w-full h-screen flex flex-col items-start justify-end p-10 flex-nowrap'>
                <div className='overflow-scroll h-full w-full my-5 border-t-2 border-b-2'>
                    { messages.map((messages, key) =>
                        <Message key={key} message={messages} user={users.find((u) => u.id == messages.from_id)}/> )}
                </div>
                <div className='w-full flex flex-row items-center gap-4'>
                    <Input onKeyUp={(e) => e.key === 'Enter' ? sendMessage() : null} value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} className='w-full'/>
                    <Button disabled={inputMessage == ''} onClick={sendMessage}>Отправить</Button>
                </div>

            </div>


            <div className='absolute top-3 left-3 flex flex-row gap-1'>
                <ModeToggle/>
                <ModalProfile openModal={openModal} setOpenModal={setOpenModal} sc={sc}/>
                {/*<EditPlayer player={me} open={editOpen} onOpenChange={setEditOpen} sc={sc}/>*/}
                <Button onClick={() => console.log(useChatStore.getState().users)} variant='outline' size='icon'><RefreshCcw/></Button>
            </div>

            <div className='absolute top-3 right-3 flex flex-row gap-3 items-center'>
                <div>
                    Ваше имя: {user?.nickname}
                </div>
                <Button disabled variant='outline'><User/> {online_count}</Button>

            </div>


        </>
    )
}