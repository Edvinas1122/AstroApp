export type Message = {
	id: string;
	chat: string;
	member: string;
	content: string;
	sent: string;
	// image: string | null;
	file?: file | null;
}

type file = {type: "image" | "video", url: string};

export type Member = {
    online: boolean | undefined;
    last_seen: boolean | undefined;
    id: string;
    chat: string;
    user: string;
    role: "invited" | "blocked" | "participant" | "admin" | null;
    about: string | null;
    since: string | null;
    picture: string;
    name: string;
}

export type Chat = {
    my_role: "invited" | "blocked" | "participant" | "admin" | null;
    id: string;
    name: string;
    public: "public" | "private" | null;
    description: string | null;
    creator: string | null;
    created_at: string | null;
}


import { actions } from "astro:actions";
import { PageStore } from "./utils/store";
import { atom } from "nanostores";
import { onSuccess, handleResult } from "./utils/result";

class MemberStore extends PageStore<Member> {
	async invite(input: Parameters<typeof actions.chat.invite>[0]) {
		return actions.chat.invite(input).then(onSuccess(
			(data: Member) => this.set(input.id, data)
		))
	}

	me(chat_id: string, email: string) {
		const member = this.find(chat_id, (m) => m.user === email);
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
	private file_resource_link = "https://pub-55793912e84f48a381166c13aae1eca8.r2.dev";

	send(
		input: Parameters<typeof actions.chat.send>[0] & { file?: File | null },
		me: string
	) {
		const me_member = members.me(input.id, me);
		const rand_id = 'awaiting-' + set_rand_id()

		const update = (method: (data: Message) => Message) => this.update(input.id,
			(m) => m.id === rand_id,
			method
		)

		const sendAction = (file_key?: string) => {
			const timeout = setTimeout(() => {
				console.log('send timmed out');
				update((message) => ({...message, sent: 'timmed out'}))
			}, 10000);
			
			actions.chat.send({...input, file_key})
				.then(onSuccess((data: Message) => update(() => data)))
				.catch((reason) => update((data) => ({...data, sent: 'failed'})))
				.finally(() => clearTimeout(timeout))
		}

		this.set(input.id, {
			id: rand_id,
			chat: input.id,
			member: me_member.id,
			sent: 'sending...',
			content: input.content,
			file: input.file ? {
				type: input.file.type.startsWith('image/') ? 'image' : 'video',
				url: URL.createObjectURL(input.file)
			} : null,
		})

		
		if (input.file) {
			console.log('message file', input.file);
			actions.upload.link({
					name: input.file.name,
					type: input.file.type,
					size: input.file.size,
					chat: input.id
			}).then(onSuccess((data: {url: string, file_link: string, key: string}) => {
				console.log('upload link received', data);
				fetch(data.url, {
					method: 'PUT',
					headers: {
						'Content-Type': input.file!.type,
					},
					body: input.file
				}).then((response) => {
					if (response.ok) {
						console.log('File uploaded successfully');
						update((message) => ({
							...message,
							sent: 'file_ok',
							file: {
								type: input.file!.type.startsWith('image/') ? 'image' : 'video',
								url: data.file_link
							}
						}));
						sendAction(data.key);
					} else {
						console.error('File upload failed', response.statusText);
						update((message) => ({...message, sent: 'failed'}));
					}
				}).catch((error) => {
					console.error('File upload error', error);
					update((message) => ({...message, sent: 'failed'}));
				});
			}))
		} else {
			const timeout = setTimeout(() => {
				console.log('send timmed out');
				update((message) => ({...message, sent: 'timmed out'}))
			}, 10000);
			
			actions.chat.send({...input})
				.then(onSuccess((data: Message) => update(() => data)))
				.catch((reason) => update((data) => ({...data, sent: 'failed'})))
				.finally(() => clearTimeout(timeout))
		}
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
		const response = await actions.chat.create(input)
		.then(onSuccess((data: Chat) => this.set(this.key, data)))
		console.log(response)
		return response
	}

	async delete(input: Parameters<typeof actions.chat.delete>[0]) {
		return actions.chat.delete(input).then((result) => {
			console.log('erase:', input.id)
			this.erase(this.key, (item) => item.id !== input.id);
			return true;
		})
	}

	async accept(input: Parameters<typeof actions.chat.accept>[0]) {
		return actions.chat.accept(input).then(onSuccess((data: unknown) => {
			this.update(this.key,
				(chat) => chat.id === input.id,
				(chat) => ({...chat, my_role: 'participant'}))
		}))
	}

	async leave(input: Parameters<typeof actions.chat.leave>[0]) {
		const result = actions.chat.leave(input)
		this.erase(this.key, 
			(chat) => chat.id === input.id
		)
	}

	async receive(input: Chat) {
		this.set(this.key, input);
	}
}

export const chats = new ChatStore({}, 
	(params) => actions.chat.chats(params).then(handleResult<Chat[]>)
);

export const route = atom<string[] | null>(null);
export const my_email = atom<string | null>(null);


import { useStore } from "@nanostores/preact";
import { useEffect } from "preact/hooks";

function messagesReduce(
    messages: Message[],
    members: Member[],
    email: string
) {
    function reduce(message: Message) {
        const member = members.find(mem => mem.id === message.member)
        if (!member) {
            console.warn("chat contains a message not of a member");
            return null;
        }
        return {
            picture: member.picture,
            sent: message.sent,
            content: message.content,
            name: member.name,
            my: member.user === email,
            file: message.file
        }
    }
    return messages.map(reduce).filter(m => !!m)
}

type RoomMessagesResult =
  | { status: "not ready"}
  | { status: "no route" }
  | {
      status: "ready";
      messages: {
		picture: string;
		sent: string;
		content: string;
		name: string;
		my: boolean;
		file: file | null | undefined;
	}[];
      members: Member[];
      loading: boolean;
      update: () => void;
      send: (input: { content: string; file: File | null }) => void;
    };

export function withRoomMessages(): RoomMessagesResult {
	const c_route = useStore(route);
	const email = useStore(my_email);
	const msg = useStore(messages.$store);
	const memb = useStore(members.$store);

	const id = c_route?.[1];

	useEffect(() => {
		if (!id || !email) return;
		messages.fetch(id);
		members.fetch(id);
	}, [id, email]);

	if (!c_route || !email) {
		return {
			status: "not ready"
		}
	}

	if (!id) {
		return {
			status: "no route"
		}
	}
	const rd_messages = messagesReduce(
		messages.get(id),
		members.get(id),
		email
	)

	return {
		status: "ready",
		messages: rd_messages,
		members: members.get(id),
		loading: messages.isLoading(id) || members.isLoading(id),
		update: () => messages.fetch(id),
		send: (input: {content: string, file: File | null}) => 
			messages.send({id: id, ...input}, email)
	}
}
