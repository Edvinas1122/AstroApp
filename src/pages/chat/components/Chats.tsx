import { useEffect } from "preact/hooks";
import {chats, $createChat_modal, route } from "@script/stores";
import type { Chat } from '@script/stores';
import { useStore } from "@nanostores/preact";
import type { VNode } from "preact";
import { createButtonEvent } from "@script/Form";
import { OptionsTablet, Option, Button } from "@ui/components/Material";


export default function ChatList() {
	const _chats = useStore(chats.$store)['default'] || [];
	const currentSelect = useStore(route);

	useEffect(() => {
		chats.fetch('default');
	}, [])


	const renderChat = (interact: (id: string) => VNode) => (item: Chat, i: number) => {
		const id = item.id;
		const selected = id === currentSelect?.at(1);
		const link = () => window.history.pushState({}, '', `/chat/${id}`);
		return <OptionsTablet
					interf={interact(id)}
					onClick={link}
					style={{zIndex: 30 - i}}
					selected={selected}>
					<>
						<p>
							<>{item.name}</>
						</p>
					</>
			</OptionsTablet>
	}

	const myChats = _chats.filter(chat => chat.my_role === 'admin');
	const participantChats = _chats.filter(chat => chat.my_role === 'participant');
	const invited = _chats.filter(chat => chat.my_role === 'invited');

	const renderMyChat = renderChat((_id) =>	{
		const action = createButtonEvent((e, reset) => {
			e.stopPropagation();
			chats.delete({id: _id}).then(() => {

				if (currentSelect?.at(1) === _id) {
					window.history.replaceState({}, '', '/chat')
				}
				reset();
			})
		})
		return <Option onClick={action} label="Delete" icon="🗑︎"
			disabled={action.loading} style={{color: "red"}}/>
		
	});

	const renderInvitedChats = renderChat((id) => <div>
		<button
			onClick={() => chats.accept({id}).then(e => {

			})}
		>
			Accept
		</button>
	</div>)

	const renderParticipantChats = renderChat((id) => <div>
		<button
			onClick={() => chats.leave({id})}
		>
			Leave
		</button>
	</div>)

	const ListPort = (<>{!!invited.length && <section>
			<p>{`Invited (${invited.length})`}</p>
			{invited.map(renderInvitedChats)}
		</section>}
		{!!myChats.length && <section>
			<p>{`My Chats (${myChats.length})`}</p>
			{myChats.map(renderMyChat)}
		</section>}
		{!!participantChats.length && <section>
			<p>{`Participants (${participantChats.length})`}</p>
			{participantChats.map(renderParticipantChats)}
		</section>}</>)

	const LoadingView = (
		<section>
			<p>Loading</p>
		</section>
	)

	return (
		<>
		{_chats.loading ? LoadingView : ListPort}
		<Button onClick={() => $createChat_modal.set(true)}><>Create Chat</></Button>
		</>
	);
}