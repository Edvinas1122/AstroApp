import { useEffect } from "preact/hooks";
import {chats, $createChat_modal, route } from "@script/stores";
import type { Chat} from '@script/stores';
import { useStore } from "@nanostores/preact";
import { ListBox } from "@ui/components/Chat";
import type { VNode } from "preact";
import { createButtonEvent } from "@script/Form";

export default function ChatList() {
	const _chats = useStore(chats.$store)['default'] || [];
	const currentSelect = useStore(route)[1];
	
	useEffect(() => {
		chats.fetch('default');
	}, [])


	const renderChat = (interact: (id: string) => VNode) => (item: Chat) => {
		const id = item.id;
		const selected = id === currentSelect;
		const link = () => window.history.pushState({}, '', `/chat/${id}`);
		return (
			<div
				style={{
					boxShadow: selected ? '0 0 0 2px #3b82f6' : 'none',
					backgroundColor: selected ? '#eff6ff' : 'transparent',
					borderRadius: '8px',
					padding: '12px',
					margin: '4px 0',
					transition: 'all 0.2s ease',
					cursor: 'pointer',
					// Add other styles as needed
				}}
				onClick={link}
			>
				<p>
					<>{item.name}</>
				</p>
				{interact(id)}
			</div>
		)
	}

	const myChats = _chats.filter(chat => chat.my_role === 'admin');
	const participantChats = _chats.filter(chat => chat.my_role === 'participant');
	const invited = _chats.filter(chat => chat.my_role === 'invited');

	const renderMyChat = renderChat((id) =>	{
		const action = createButtonEvent((e, reset) => {
			e.stopPropagation();
			chats.delete({id}).then(() => {
				reset();
				if (currentSelect === id) {
					window.history.replaceState({}, '', '/chat')
				}
			})
		})
		return	<button
					disabled={action.loading}
					onClick={action}
			>Delete</button>
		
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

	return (
		<>
			<ListBox
				width='200px'
				header={<>Chats</>}
				footer={
					<button onClick={() => $createChat_modal.set(true)}>Create Chat</button>
				}>
				<>
					{!!invited.length && <section>
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
					</section>}
					{/* <div ref={chatEndRef}/> */}
				</>
			</ListBox>
		</>
	);
}