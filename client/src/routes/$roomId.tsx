import {createFileRoute, Navigate} from '@tanstack/react-router'
import {toast} from "sonner";
import {SocketController} from "@/store/socket-controller.ts";
import RoomId from "@/components/roomId.tsx";

export const Route = createFileRoute('/$roomId')({
  component: RouteComponent,
})

function RouteComponent() {
    const { roomId } = Route.useParams()

    const socketController = new SocketController(roomId);

    console.log("root room")

    if (roomId.length < 5) {
        toast.info("Длина id комнаты должна быть больше 5")
        return <Navigate to='/'/>
    }

    return <RoomId sc={socketController}/>
}
