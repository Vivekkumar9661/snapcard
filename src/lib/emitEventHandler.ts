import axios from "axios";


async function emitEventHandler({ socketId, event, data }: {
    socketId?: string;
    event: string;
    data: any;
}) {
    try {
        await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/notify`, {
            socketId,
            event,
            data
        })
    } catch (error) {
        console.log("Error in emitEventHandler:", error)
    }
}
export default emitEventHandler