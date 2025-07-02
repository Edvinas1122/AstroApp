export type Message = {
	id: string;
	chat: string;
	member: string;
	content: string;
	sent: string;
}

export type Member = {
	online: boolean | undefined,
	last_seen: number | undefined,
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
	console.log('before')
	if (result.error) {
		console.log('error occured');
		throw new Error("failed to fetch:", result.error);
	}
	console.log('after', result);
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

	me(chat_id: string, email: string) {
		const member = this.find(chat_id, (m) => m.user.email === email);
		if (!member) throw new Error('not a chat member');
		return member;
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

const set_rand_id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);


class MessageStore extends PageStore<Message & {}> {
	send(input: Parameters<typeof actions.chat.send>[0], me: string) {

		const me_member = members.me(input.id, me);
		const rand_id = 'awaiting-' + set_rand_id()

		this.set(input.id, {
			id: rand_id,
			chat: input.id,
			member: me_member.ch_member.id,
			// sent: formatDate(new Date()),
			sent: 'sending...',
			content: input.content
		})

		const update = (method: (data: Message) => Message) => this.update(input.id,
			(m) => m.id === rand_id,
			method
		)

		const timeout = setTimeout(() => {
			console.log('send timmed out');
			update((message) => ({...message, sent: 'timmed out'}))
		}, 10000);
		
		actions.chat.send(input)
			.then(onSuccess((data: Message) => update(() => data)))
			.catch((reason) => update((data) => ({...data, sent: 'failed'})))
			.finally(() => clearTimeout(timeout))
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

	async accept(input: Parameters<typeof actions.chat.accept>[0]) {
		return actions.chat.accept(input).then(onSuccess((data: unknown) => {
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