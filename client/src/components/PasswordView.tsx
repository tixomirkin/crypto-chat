import {useChatStore} from "@/store/chat.ts";
import {Input} from "@/components/ui/input.tsx";
import {SocketController} from "@/store/socket-controller.ts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {useState} from "react";
import {toast} from "sonner";
import {decryptChatKey} from "@/lib/crypto.ts";

export default function PasswordView({sc} : {sc: SocketController}) {
    // const {admin_id} = useChatStore(state => ({
    //     encrypted_key : state.encrypted_key,
    //     admin_id : state.admin_id,
    // }))


    console.log("ps")
    const admin_id = useChatStore(state => state.admin_id)
    const encrypted_key = useChatStore(state => state.encrypted_key)
    // const key = useChatStore(state => state.key)

    const isNewRoom = sc.socket.id == admin_id && encrypted_key == '';

    const [inputPassword, setInputPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function onSave() {
        setIsLoading(true)

        if (inputPassword.length > 5) {
            if (isNewRoom) {
                await sc.sendSetKey(inputPassword)
            }
            else {
                try {
                    const key = await decryptChatKey(encrypted_key, inputPassword)
                    useChatStore.getState().setKey(key)
                } catch (error) {
                    // @ts-ignore
                    toast.error(error.message)
                }
            }

        }
        else {
            toast.warning("Пароль должен быть больше 5 символов")
        }

        setIsLoading(false)
    }

    return (
        <main
            className='bg-background w-full h-screen flex transition-colors justify-center items-center p-5'>
            <Card className='w-100'>
                <CardHeader>
                    <CardTitle>
                        {/*<Button onClick={() => navigate({to: '/'})} className='mr-3' variant='outline' size='icon'><ChevronLeft/></Button>*/}
                        {isNewRoom ? 'Задайте пароль комнате' : 'Введите пароль от комнаты'}
                    </CardTitle>
                    <CardDescription>Это пароль шифрует ващи сообщения между собеседниками</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='mb-4'>
                        <Label className='mb-1.5' htmlFor="password">Пароль от комнаты</Label>
                        <Input onKeyUp={(e) => e.key === 'Enter' ? onSave() : null}  value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} required className='mb-1.5' id='password' type='password' placeholder=''/>
                    </div>

                    <Button disabled={isLoading} onClick={onSave} className='w-full'>
                        {isLoading && <Spinner/>}
                        Войти
                    </Button>

                </CardContent>

            </Card>

        </main>
    )
}