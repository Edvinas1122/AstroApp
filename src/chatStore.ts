type Message = {
	id: string;
	chat: string;
	member: string;
	content: string;
	sent: string;
}

type Member = {
	ch_member: {
		id: string;
		chat: string;
		user: string;
		role: "invited" | "blocked" | "participant" | "admin" | null;
		about: string | null;
		since: string | null;
	};
	user: {
		email: string;
		given_name: string;
		family_name: string;
		name: string;
		picture: string;
		sub: string;
		signed: string | null;
	};
}

import { actions, type SafeResult } from "astro:actions";
import { PageStore } from "./utils/store";
import { atom } from "nanostores";


function handleResult<T>(result: SafeResult<{
    id: string;
    page: number;
}, {
    [x: string]: any;
}[]>) {
	if (result.error) throw new Error("failed to fetch");
	return result.data as T;
}

export const members = new PageStore<Member>(
	{},
	(params) => actions.chat.members(params).then(handleResult<Member[]>),
	// (member) => member.ch_member.id,
)

function formatDate(date: Date) {
  const isoString = date.toISOString();
  return isoString
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '');
}

class MessageStore extends PageStore<Message> {
	
	send(input: Parameters<typeof actions.chat.send>[0]) {
		actions.chat.send(input).then(result => {
			console.log('sent message:', result);
			if (result.error) throw new Error(result.error.message);
			this.set(input.id, {...result.data, sent: formatDate(new Date())} as Message);
		})
	}
	
	receive(message: Message) {
		this.set(message.chat, message);
		console.log('received live message in ', message.chat, "content:" , message.content);
	}
}

export const messages = new MessageStore(
	{},
	(params) => actions.chat.messages(params).then(handleResult<Message[]>)
)

export const $socket = atom<WebSocket | null>(null);
