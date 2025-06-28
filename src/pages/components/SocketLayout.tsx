import { useEffect, useRef, useState } from "preact/hooks"
import {
	onConnect,
	onMessage
} from '../../handlers'

export function Socket({
	children,
	url
}:{
	children: ChildNode,
	url: string,
}) {
	
	const {socket, connect} = useAuthWebSocket(url, "/socket/keys");
	const reconnect = useReconnect(connect)

	useEffect(() => {
		if (socket) {
			socket.onmessage = onMessage(socket);
			socket.onopen = onConnect(socket);
			socket.onclose = reconnect;
		}
		return () => socket?.close();
	}, [socket])

	return (
		<>
			{children}
		</>
	)
}

function useReconnect(
	connect: () => Promise<boolean>,
	delayS: number = 5,
	reconnectCount: number = 3,
	delayAfterCountS: number = 60,
) {
	const [count, setCount] = useState(0);
	const [works, setWorks] = useState(true);

	const reconnect = (arg: CloseEvent) => {
		console.log('disconnected, ', arg.reason);
		setWorks(false)
	}

	const updateState = (works: boolean) => {
		setWorks(works)
		setCount(works ? 0 : prev => prev + 1);
	}

	const errorBehaviour = (error: any) => {
		console.log('socket reconnect error', error.message);
		setWorks(false); setCount(prev => prev + 1);
	}

	const delaySetMS = () => {
		const delay = reconnectCount > count ? delayS : delayAfterCountS
		console.log("attempt reconnect in:", delay, "attempt:", count);
		return delay * 1000; // to millis
	}

	useEffect(() => {
		if (!works) {
			const timmer = setTimeout(() => {
				connect()
					.then(updateState)
					.catch(errorBehaviour)
			}, delaySetMS())
			return () => {
				console.log("clear attempt countdown")
				clearTimeout(timmer)
			} 
		}
	}, [connect, works])
	
	return reconnect;
}

function useAuthWebSocket(url: string, auth_url: string) {

	const [socket, setSocket] = useState<WebSocket|null>(null);

	const connect = () => fetch(auth_url)
			.then((response) => response.json() as Promise<{ key: string }>)
			.then((token) => {
				const address = new URL(url);
				address.pathname = 'websocket';
				address.searchParams.set('token', token.key);
				console.log('connecting to socket');
				return new WebSocket(address.href)
			})
			.then(setSocket)
			.then(() => true)

	useEffect(() => {
		connect()
	}, [])

	return {socket, connect};
}
