import { Card, Button, Profile } from "../components/Material";
import styles from "./Profile.module.css";
import { useStore } from "@nanostores/preact";

const props = {
	name: "Edvinas",
	last_name: "Momkus",
	picture: "https://lh3.googleusercontent.com/a/ACg8ocKLrIEeTe5uEhAP35v4sBCM9OSwezEtRpLIW4IouBqXuDXkoaKz=s96-c"
}

export function ProfileView() {

	// const profile = useStore()
    
    const Header = (
		<div class={styles.user}>
		<Profile
            // style={{width: "40px", height: "40px"}}
			src={props.picture}
			alt={`${props.name}-profile`}
		/>
			<p>
				{props.name} {props.last_name}
			</p>
        </div>
    )

    return (
		<>
			<Card
				header={Header}
				class={styles.profileCard}
			>
				<div style={{display: "flex", flexDirection: "row", gap: "4px"}}>
				<Button>
					<i class="fas fa-user-plus"></i> Invite
				</Button>
				<Button>
					<i class="fas fa-envelope"></i> Message
				</Button>
				<Button>
					Profile
				</Button>
				</div>
			</Card>
		</>
    )
}