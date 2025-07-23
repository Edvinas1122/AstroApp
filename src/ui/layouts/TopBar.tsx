import type { ComponentChildren } from "preact"
import styles from "./SidePannel.module.css"

interface TobBarLayoutProps {
    children?: ComponentChildren,
    header?: ComponentChildren
}

export default function TopBarLayout({
    children,
    header
}: TobBarLayoutProps) {
    return (
        <>
            <header class={styles.header_bar}>
                {header}
            </header>
            {children}
        </>
    )
}