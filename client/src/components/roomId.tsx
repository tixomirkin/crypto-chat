import {SocketController} from "@/store/socket-controller.ts";
import {useChatStore} from "@/store/chat.ts";
import PasswordView from "@/components/PasswordView.tsx";
import {ChatView} from "@/components/ChatView.tsx";

export default function RoomId({sc} : {sc: SocketController}) {

    const key = useChatStore(state => state.key)

    console.log("RoomId")

    if (key === null) {
        return <PasswordView sc={sc}/>
    }

    if (!(key instanceof CryptoKey)) {
        console.log(key);
        useChatStore.getState().setKey(null)
    }

    return <ChatView sc={sc}/>
}