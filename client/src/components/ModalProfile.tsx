import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import {SocketController} from "@/store/socket-controller.ts";
import {useChatStore} from "@/store/chat.ts";
import {UserPen} from "lucide-react";

export default function ModalProfile({sc, openModal, setOpenModal} : {sc: SocketController, openModal: boolean, setOpenModal: (open: boolean) => void}) {



    const [inputColor, setInputColor] = useState('white')
    const [inputNickname, setInputNickname] = useState('')

    useEffect(() => {
        if (openModal) {
            const user = useChatStore.getState().users.find((u) => u.id == sc.socket.id)
            if (user) {
                setInputNickname(user.nickname)
                setInputColor(user.color)
            }
        }
    }, [openModal]);

    async function onSave() {
        if (inputNickname.length < 4) {
            toast.warning("Минимальная длина никнейма 4 символа")
            return
        }

        sc.sendChangeUser(inputNickname, inputColor)

        setOpenModal(false)
    }

    // useHotkeys('enter', onSave)

    return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
                <Button variant="outline" size='icon'><UserPen/></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Редактирование профиля</DialogTitle>
                    <DialogDescription>
                       Эти настройки применяються только для данного чата
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="username-1">Ваш никнейм</Label>
                        <Input value={inputNickname} onChange={(e) => setInputNickname(e.target.value)} id="username-1" name="username"/>
                    </div>

                    <div className='mb-4'>
                        <Select value={inputColor} defaultValue='white' onValueChange={(color) => setInputColor(color)}>
                            <Label className='mb-1.5' htmlFor="color">Цвет никнейма</Label>
                            <SelectTrigger  id='color' className="w-full">
                                <SelectValue  placeholder="Выберите цвет" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Цвета</SelectLabel>
                                    <SelectItem value="white" ><div className=''>Стандартный</div></SelectItem>
                                    <SelectItem value="red" ><div className='text-red-500'>Крссный</div></SelectItem>
                                    <SelectItem value="yellow" ><div className='text-yellow-500'>Желтый</div></SelectItem>
                                    <SelectItem value="green" ><div className='text-green-500'>Зеленый</div></SelectItem>
                                    <SelectItem value="blue" ><div className='text-blue-500'>Синий</div></SelectItem>
                                    <SelectItem value="violet" ><div className='text-violet-500'>Фиолетовый</div></SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Отмена</Button>
                    </DialogClose>
                    <Button onClick={onSave}>Сохранить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}