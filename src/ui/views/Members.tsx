import type { Member } from "@root/src/script/stores";
import { useEffect, useRef } from "preact/hooks";
import type { VNode } from "preact";
import { ListBox, ChatUserMini } from '@ui/components/Chat';
import { Center } from '@ui/components/Material';

interface MembersViewReq {
    members: Member[],
}

export default function MembersView({
    members,

}: MembersViewReq) {

    const admins = members.filter(memb => memb.role === 'admin');
    const participants = members.filter(memb => memb.role === 'participant');
    const invited = members.filter(memb => memb.role === 'invited');

    const renderMember = (item: Member) => <ChatUserMini 
            picture={{url: item.picture, alt: `profile-icon-${item.name}`}}
            name={item.name}
            online={item.online}
    />;

    return (
        // <ListBox
        //     width='200px'
        //     header={<>Members</>}
        //     footer={invite}
        // >
        <div style={{
            display: "flex",
            flexDirection: "column",
            overflowY: "scroll"    
        }}>
            {members.length > 1 ? <><section>
                <p>Admin</p>
                    {admins.map(renderMember)}
                </section>
                {!!participants.length && <section>
                    <p>Participants</p>
                    {participants.map(renderMember)}
                </section>}
                {!!invited.length && <section>
                    <p>Invited</p>
                    {invited.map(renderMember)}
                </section>}</> 
                : (<Center><p>Invite wonderers to chat with them</p></Center>)
            }
        </div>
        // </ListBox>
    )
}