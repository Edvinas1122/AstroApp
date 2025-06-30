import { useStore } from "@nanostores/preact";
import { $invite_modal, route } from "../../../chatStore";
import { Modal} from "../../../ui/Material";
import { useEffect, useState } from "preact/hooks";
import { actions } from "astro:actions";
import { createFormAction } from "../../../ui/utils";

type User = {
    email: string;
    given_name: string;
    family_name: string;
    name: string;
    picture: string;
    sub: string;
    signed: string | null;
}


export function InviteModal() {
	const id = useStore(route)[1];
	const open = useStore($invite_modal);
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		if (open) {
			actions.user.search({query: ''}).then(result => {
				console.log(result.data);
				if (result.error) throw new Error('failed users fetch');
				setUsers(result.data);
			})
		}
	}, [open]);


	const submit = createFormAction(['email'], ({email}) => {
		actions.chat.invite({id, user: email}).then(result => {
			if (result.error) throw new Error('failed fetch invite')
			console.log(result.data.values)
		})
	})

	return (
		<Modal
			isOpen={open}
			header={<h2>Invite a user</h2>}
			close={() => $invite_modal.set(false)}
		>
			<form onSubmit={submit}>
				<select name="email">
					{
						users.map((item) => (
								<option value={item.email}>
									{item.given_name} {item.email}
								</option>
						))
					}
				</select>
				<button type="submit">Add</button>
			</form>
		</Modal>
	);
}

import {
	$createChat_modal,
	chats
} from "../../../chatStore";

export function CreateChatModal() {
	const open = useStore($createChat_modal);

	const submit = createFormAction(['name'], (input) => {
		chats.create(input)
		$createChat_modal.set(false);
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
				/>
				<button type="submit">Create</button>
			</form>
		</Modal>
	);
}

// import type { PreinitializedWritableAtom } from "nanostores";

// function buildWarningModal(
// 	message: string,
// 	title: string,
// 	action: () => void,
// 	$open: PreinitializedWritableAtom<boolean> & object
// ) {
// 	return () => {
// 		const open = useStore($open);

// 		const agree = () => {
// 			action();
// 			$open.set(false)
// 		}

// 		return (
// 			<Modal
// 				isOpen={open}
// 				close={() => $open.set(false)}
// 				header={<h2>{title}</h2>}
// 			>
// 				<p>{message}</p>
// 				<button onClick={agree}>Continue</button>
// 			</Modal>
// 		)
// 	}
// }
