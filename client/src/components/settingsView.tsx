import {useNavigate} from "@tanstack/react-router";
import {useState} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ModeToggle} from "@/components/mode-toggle.tsx";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {TChat} from "@/store/types.ts";
import {toast} from "sonner";
import {Spinner} from "@/components/ui/spinner.tsx";
import { ChevronLeft } from "lucide-react";
import {decryptChatKey} from "@/lib/crypto.ts";


export const SettingsView = ({roomId, isNewRoom = false} : {roomId: string, isNewRoom: boolean}) => {
    const navigate = useNavigate({ from: '/$roomId' })
    const [inputPassword, setInputPassword] = useState('')
    const [inputColor, setInputColor] = useState('')
    const [inputNickname, setInputNickname] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function onSave() {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (!isNewRoom) {
            const r = await fetch(import.meta.env.VITE_PARTY_KIT_DOMAIN+ '/' + roomId, {method: 'GET'})
            if (r.status != 200) {
                toast.error('Ошибка')
            }
            try {
                const chat: TChat = JSON.parse(await r.json())
                const key = await decryptChatKey(chat.encrypted_key, inputPassword)
                console.log(key)
                navigate({to: '/$roomId', params: {roomId: roomId}})
            } catch (error) {
                // @ts-ignore
                toast.error(error.message)
            }


        }

        if (isNewRoom) {
            navigate({to: '/$roomId', params: {roomId: roomId}})
        }

        setIsLoading(false)



    }

    return <main
        className='bg-background w-full h-screen flex transition-colors justify-center items-center p-5'>
        <Card className='w-100'>
            <CardHeader>
                <CardTitle>
                    <Button onClick={() => navigate({to: '/'})} className='mr-3' variant='outline' size='icon'><ChevronLeft/></Button>
                    CryptoChat - {isNewRoom ? 'Новая комната' : 'Подключение к комнате'}
                </CardTitle>
                <CardDescription>ID: {roomId}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='mb-4'>
                    <Label className='mb-1.5' htmlFor="password">Пароль от комнаты</Label>
                    <Input value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} required className='mb-1.5' id='password' type='password' placeholder=''/>
                </div>

                <div className='mb-4'>
                    <Label className='mb-1.5' htmlFor="nickname">Никнейм</Label>
                    <Input value={inputNickname} onChange={(e) => setInputNickname(e.target.value)} required className='mb-1.5' id='nickname' placeholder='Swag2007'/>
                </div>

                <div className='mb-4'>
                    <Select value={inputColor} onValueChange={(color) => setInputColor(color)}>
                        <Label className='mb-1.5' htmlFor="color">Цвет никнейма</Label>
                        <SelectTrigger  id='color' className="w-full">
                            <SelectValue  placeholder="Выберите цвет" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Цвета</SelectLabel>
                                <SelectItem value="red" ><div className='text-red-500'>Крссный</div></SelectItem>
                                <SelectItem value="yellow" ><div className='text-yellow-500'>Желтый</div></SelectItem>
                                <SelectItem value="green" ><div className='text-green-500'>Зеленый</div></SelectItem>
                                <SelectItem value="blue" ><div className='text-blue-500'>Синий</div></SelectItem>
                                <SelectItem value="violet" ><div className='text-violet-500'>Фиолетовый</div></SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <Button disabled={isLoading} onClick={onSave} className='w-full'>
                    {isLoading && <Spinner/>}
                    Сохранить
                </Button>

            </CardContent>
            <CardFooter>
                <div className="flex items-center justify-between w-full">
                    <p>Made by @tixomirkin</p>
                    <ModeToggle/>
                </div>
            </CardFooter>
        </Card>

    </main>
}