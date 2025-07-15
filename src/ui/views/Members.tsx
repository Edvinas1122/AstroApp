import type { Member } from "@root/src/script/stores";
import { useEffect, useRef } from "preact/hooks";
import type { VNode } from "preact";
import { ListBox, ChatUserMini } from '@ui/components/Chat';
import { Center, OptionsTablet, Option } from '@ui/components/Material';

interface MembersViewReq {
    members: Member[],
}

export default function MembersView({
    members,

}: MembersViewReq) {

    const admins = members.filter(memb => memb.role === 'admin');
    const participants = members.filter(memb => memb.role === 'participant');
    const invited = members.filter(memb => memb.role === 'invited');

    const buidRenderMember = (interact: (role: Member['role']) => VNode | undefined) => (item: Member) => <OptionsTablet
        interf={interact(item.role)}
        selected={false}
    ><ChatUserMini 
            picture={{url: item.picture, alt: `profile-icon-${item.name}`}}
            name={item.name}
            online={item.online}
    /></OptionsTablet>;

    const interact = (role: Member['role']) => {
        switch (role) {
            case 'admin':
                return undefined;
            case 'invited':
                return <Option
                    onClick={() => {}}
                    label="remove" icon=""
                    disabled={false}
                />
            default:
                return <></>
        }
    }

    const renderRoles = buidRenderMember(interact)

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            overflowY: "scroll"    
        }}>
            {members.length > 1 ? <><section>
                <p>Admin</p>
                    {admins.map(renderRoles)}
                </section>
                {!!participants.length && <section>
                    <p>Participants</p>
                    {participants.map(renderRoles)}
                </section>}
                {!!invited.length && <section>
                    <p>Invited</p>
                    {invited.map(renderRoles)}
                </section>}</> 
                : (<Center><p>Invite wonderers to chat with them</p></Center>)
            }
        </div>
    )
}