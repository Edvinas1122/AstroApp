import { $invite_modal, withRoomMessages } from "@script/stores";
import { createFormAction } from "@script/Form";
import { Messages } from "@ui/components/MessageSection";
import { WritingArea } from "@ui/components/Chat";
import { RightPannelLayout } from "@ui/layouts/SidePannel";
import MembersView from "@ui/views/Members";



export default function ChatRoomPort() {
    const data = withRoomMessages();

    if (data.status === "not ready") {
        return <Center><p>loading</p></Center>
    } else if (data.status === "no route") {
        return <Center><p>no route</p></Center>
    }

    const submit = createFormAction([
            'content',
            {type: 'file', name: 'attachment'}
        ], ({content, attachment}, reset) => {
            const file = attachment.size ? attachment : null;
            data.send({content, file})
            reset();
        })

    const Loading = (
        <Center style={{height: "100%"}}><p>Loading</p></Center>
    )

    return (
        <RightPannelLayout
			right={
				<>
				<MembersView
					members={data.members}
					/>
                <Button onClick={() => $invite_modal.set(true)}><>Invite</></Button>
				</>
			}
		>
        <div style={{
            display: "flex",
            height: "-webkit-fill-available",
            flexDirection: "column",
        }}>
        <ScrollBottomContainer>
        {data.loading ?
            Loading : 
            <Messages
                messages={data.messages}
        />}
        </ScrollBottomContainer>
        <WritingArea
            onSubmit={submit}
            submit={submit.form}
            />
        </div>
        </RightPannelLayout>
    )
}

import { useRef, useEffect  } from "preact/hooks";
import type { ComponentChild } from "preact";
import { Button, Center } from "@root/src/ui/components/Material";

interface ScrollBottomContainerProps {
	children: ComponentChild
}

export function ScrollBottomContainer({ children }: ScrollBottomContainerProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = containerRef.current;
		if (el) {
			el.scrollTop = el.scrollHeight;
		}
	}, [children]);

	return (
		<div
			ref={containerRef}
			style={{
				overflowY: "auto",
				flex: 1,
				height: "-webkit-fill-available",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{children}
		</div>
	);
}