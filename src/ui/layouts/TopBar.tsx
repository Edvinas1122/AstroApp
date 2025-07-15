import type { ComponentChildren, VNode } from "preact"
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
            <header style={styles.header}>
                {header}
            </header>
            <>
                {children}
            </>
        </>
    )
}