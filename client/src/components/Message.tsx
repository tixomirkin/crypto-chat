import {TMessage, TUser} from "@/store/types.ts";

export default function Message({message, user}: {message: TMessage, user: TUser | undefined}) {

    var className = ''

    if (user) {
        if (user.color == 'red') className='text-red-500'
        if (user.color == 'yellow') className='text-yellow-500'
        if (user.color == 'green') className='text-green-500'
        if (user.color == 'blue') className='text-blue-500'
        if (user.color == 'violet') className='text-violet-500'
    }

    return (
        <div className='flex-row flex gap-2'>
            <div className={className}>
                <b>
                    {user ? user.nickname : "?????"} {" : "}
                </b>
            </div>
            <div>
                {message.message}
            </div>
        </div>


    )
}