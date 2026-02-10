import axios from "axios";


async function emitEventHandler({ socketId, event, data }: {
    socketId?: string;
    event: string;
    data: any;
}) {
    try {
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
        await axios.post(`${SOCKET_URL}/notify`, {
            socketId,
            event,
            data
        })
    } catch (error) {
        console.log("Error in emitEventHandler:", error)
    }
}
export default emitEventHandler