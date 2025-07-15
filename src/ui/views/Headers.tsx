import { OptionsTablet } from "../components/Material"

export default function Headers() {
    return (
        <div style={{display: "flex", flexDirection: "row"}}>
            <OptionsTablet>
                <nav>
                    Blog
                </nav>
            </OptionsTablet>
            <OptionsTablet selected={true}>
                <nav>
                    Chat
                </nav>
            </OptionsTablet>
            <OptionsTablet
                href={"/profile"}
            >
                <nav>
                    Profile
                </nav>
            </OptionsTablet>
        </div>
    )
}