import { useEffect, useState } from "preact/hooks"
import {
	onConnect,
	onMessage
} from './socket.handlers'
import { useStore } from "@nanostores/preact";
import { $socket } from "./stores";

export function Socket({
	children,
	url
}:{
	children: ChildNode,
	url: string,
}) {
	
	const {socket, connect} = useAuthWebSocket(url);
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
	maxReconnectCount: number = 15
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
		if (maxReconnectCount > count) {
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
		} else {
			console.log('max reconnect count exceeded');
		}
	}, [connect, works])
	
	return reconnect;
}

import {actions} from "astro:actions";
import { onSuccess } from "./utils/result";

function useAuthWebSocket(url: string) {

	const socket = useStore($socket)

	const connect = () => actions.user.socket_key({})
			.then(onSuccess((token: string) => {
				const address = new URL(url);
				address.pathname = 'websocket';
				address.searchParams.set('token', token);
				console.log('connecting to socket');
				return new WebSocket(address.href)
			}))
			.then($socket.set)
			.then(() => true)

	useEffect(() => {
		if (!$socket.get()) {
			connect()
		}
	}, [])

	return {socket, connect};
}
