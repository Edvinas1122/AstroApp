export type Message = {
	id: string;
	chat: string;
	member: string;
	content: string;
	sent: string;
}

export type Member = {
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

export type Chat = {
	chat: {
        id: string;
        name: string;
        public: "public" | "private" | null;
        description: string | null;
        created_at: string | null;
    };
    ch_member: {
        id: string;
        chat: string;
        user: string;
        role: "invited" | "blocked" | "participant" | "admin" | null;
        about: string | null;
        since: string | null;
    };
}

import { actions, type SafeResult } from "astro:actions";
import { PageStore } from "./utils/store";
import { atom } from "nanostores";


function handleResult<T>(result: SafeResult<any, any>) {
	if (result.error) throw new Error("failed to fetch:", result.error);
	console.log('handling store result:', result.data);
	return result.data as T;
}

function onSuccess<T, RET>(handler: (data: T) => RET) {
	return (result: SafeResult<any, any>) => {
		const data = handleResult(result);
		return handler(data as T);
	}
}

class MemberStore extends PageStore<Member> {
	async invite(input: Parameters<typeof actions.chat.invite>[0]) {
		return actions.chat.invite(input).then(onSuccess(
			(data: Member) => this.set(input.id, data)
		))
	}

	// accept(input: Parameters<typeof actions.chat.accept>[0]) {
	// 	actions.chat.accept(input).then(onSuccess((data: unknown) => {
	// 		this.update(input.id,
	// 			(member) => member.user.email === input.member,
	// 			(member) => ({...member, ch_member: {...member.ch_member, role: 'participant'}})
	// 		)
	// 	}))
	// }
}

export const members = new MemberStore(
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
		actions.chat.send(input)
		.then(onSuccess((data: Message) => this.set(input.id, 
			{...data, sent: formatDate(new Date())}
		)))
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

export const $invite_modal = atom<boolean>(false);
export const $createChat_modal = atom<boolean>(false);

class ChatStore extends PageStore<Chat> {

	public key = 'default'

	async create(input: Parameters<typeof actions.chat.create>[0]) {
		return actions.chat.create(input)
		.then(onSuccess((data: Chat) => this.set(this.key, data)))
	}

	async delete(input: Parameters<typeof actions.chat.delete>[0]) {
		return actions.chat.delete(input).then((result) => {
			this.erase(this.key, (item) => item.chat.id !== input.id);
			return true;
		})
	}

	accept(input: Parameters<typeof actions.chat.accept>[0]) {
		actions.chat.accept(input).then(onSuccess((data: unknown) => {
			this.update(this.key,
				(chat) => chat.chat.id === input.id,
				(chat) => ({...chat, ch_member: {...chat.ch_member, role: 'participant'}}))
		}))
	}
}

export const chats = new ChatStore({}, 
	(params) => actions.chat.chats(params).then(handleResult<Chat[]>)
);

export const route = atom<string[]>([]);