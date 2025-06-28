import {map} from "nanostores";

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

import { actions } from "astro:actions";

class Pages {
	private fetched = new Map<string, {page: number}>()

	public with(key: string, handler: () => Promise<void>) {
		if (!this.fetched.has(key)) {
			handler().then(() => {
				this.fetched.set(key, {page: 0});
			})
		}
	}
}


export const members = {
	$members: map<Record<string, Member[]>>({}),

	set: function (chat_id: string, member: Member) {
		this.$members.setKey(chat_id, [
			...(this.$members.get()[chat_id] || []),
			member
		]);
	},

	setMany: function (chat_id: string, member: Member[]) {
		this.$members.setKey(chat_id, [
			...(this.$members.get()[chat_id] || []),
			...member
		]);
	},

	pages: new Pages(),
	fetch: function (chat_id: string) {
		this.pages.with(chat_id, () =>
			actions.chat.members({chat_id, page: 0})
				.then(members => {
					if (members.error) throw new Error('failed member fetch');
					this.setMany(chat_id, members.data as Member[]);
				})
		)
	}
}



const $messages = map<Record<string, Message[]>>({});

function set(chat_id: string, message: Message) {
	$messages.setKey(chat_id, [
		...($messages.get()[chat_id] || []),
		message
	])
	console.log($messages.get());
}


function send(input: Parameters<typeof actions.chat.send>[0]) {
	actions.chat.send(input).then(result => {
		console.log('sent message:', result);
		if (result.error) throw new Error(result.error.message);
		set(input.chat_id, {...result.data, sent: formatDate(new Date())});
	})
}

function formatDate(date: Date) {
  const isoString = date.toISOString();
  return isoString
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '');
}

function receive(message: Message) {
	// console.log($messages.get()[message.chat])
	set(message.chat, message);
	console.log('received live message in ', message.chat, "content:" , message.content);
	// alert(JSON.stringify(message));
}

const fetched = new Map<string, {page: number}>()

function fetch(chat_id: string) {
	const pages = fetched.get(chat_id);
	if (!pages) {
		actions.chat.messages({chat_id, page: 0}).then(result => {
			console.log('fetch messages:', result)
			if (result.error) throw new Error(result.error.message);
			result.data.forEach(message => set(chat_id, message));
		})
		fetched.set(chat_id, {page: 0});
	}
}

export const chat = {
	$messages,
	set,
	send,
	fetch,
	receive
}