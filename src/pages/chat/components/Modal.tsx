import { useStore } from "@nanostores/preact";
import { $invite_modal, members, route } from "@script/stores";
import { Modal} from "@root/src/ui/components/Material";
import { useEffect, useState, useRef } from "preact/hooks";
import { actions } from "astro:actions";
import { createFormAction } from "@script/Form";
import {
	$createChat_modal,
	chats
} from "@script/stores";

type User = {
    email: string;
    given_name: string;
    family_name: string;
    name: string;
    picture: string;
    sub: string;
    signed: string | null;
}

function withFocus(open: boolean) {
	const focusRef = useRef<HTMLInputElement & HTMLSelectElement>(null);

	useEffect(() => {
		if (open) focusRef.current?.focus();
	}, [open]);

	return focusRef;
}

export function InviteModal() {
	const id = useStore(route)[1];
	const open = useStore($invite_modal);
	const focusRef = withFocus(open);
	const [users, setUsers] = useState<User[]>([]);
	const [online, setOnline] = useState(0);

	const submit = createFormAction(['email'], ({email}, reset) => {
		members.invite({id, user: email}).then(memb => {
			$invite_modal.set(false); reset();
		})
	})

	useEffect(() => {
		if (open) {
			actions.user.online({}).then(result => {
				console.log(result);
				setOnline(result.data);
			})
			actions.user.search({query: ''}).then(result => {
				console.log(result.data);
				if (result.error) throw new Error('failed users fetch');
				setUsers(result.data);
			})
		}
	}, [open]);

	const Header = (
		<>
			<h2>Invite a user</h2>
			<p>currently online {online}</p>
		</>
		)

	return (
		<Modal
			isOpen={open}
			header={Header}
			close={() => $invite_modal.set(false)}
		>
			<form onSubmit={submit}>
				<select name="email" disabled={submit.loading} ref={focusRef}>
					{
						users.map((item) => (
								<option value={item.email}>
									{item.given_name} {item.email}
								</option>
						))
					}
				</select>
				<button type="submit" disabled={submit.loading}>Add</button>
			</form>
		</Modal>
	);
}

export function CreateChatModal() {
	const open = useStore($createChat_modal);
	const focusRef = withFocus(open);

	const submit = createFormAction(['name'], ({name}, reset) => {
		chats.create({name}).then(chat => {
			$createChat_modal.set(false);
			window.history.pushState({}, '', `/chat/${chat.id}`)
			reset();
		})
	});

	return (
		<Modal
			isOpen={open}
			close={() => $createChat_modal.set(false)}
			header={<h2>Chat</h2>}
		>
			<form onSubmit={submit}>
				<input type="text" name='name' placeholder='type name here...'
					maxLength={15} minLength={3}
					disabled={submit.loading}
					ref={focusRef}
				/>
				<button type="submit" disabled={submit.loading}>
					Create
				</button>
			</form>
		</Modal>
	);
}
