import { useEffect, useRef, useState } from 'preact/hooks';
import style from './SidePannel.module.css';

interface SidePannelLayoutProps {
    left?: preact.ComponentChildren;
    children?: preact.ComponentChildren;
    right?: preact.ComponentChildren;
    class?: string;
}

export function SidePannelLayout({
	left,
	children,
	right,
	class: className = '',
}: SidePannelLayoutProps) {

	const [mediaLeft, setMediaLeft] = useState(false);
	const [mediaRight, setMediaRight] = useState(false);

	const scaleHandle = (ev: MediaQueryListEvent) => {
		console.log('scale trigger :)', ev.matches);
		setMediaLeft(ev.matches);
		setMediaRight(ev.matches);
	}

	useEffect(() => {
		const ob = window.matchMedia("(width > 820px)");
		setMediaLeft(ob.matches); setMediaRight(ob.matches);
		ob.addEventListener('change', scaleHandle);
		return () => ob.removeEventListener('change', scaleHandle);
	}, [])

	const toggleLeft = () => setMediaLeft(!mediaLeft)
	const toggleRight = () => setMediaRight(!mediaRight)

	const renderButton = (symbol: string, action: () => void) => <button
		class={style.cButton}
		onClick={action}
	>
		{symbol}
	</button>

	return (
		<div class={`${style.layout} ${className}`}>
			<aside class={style.panel} 
				style={{
					maxWidth: "200px",
					width: mediaLeft ? "20%" : "30px"
				}}
			>
				{left}
				<div class={style.sideCtrl}>
				{renderButton(mediaLeft ? "<" : ">", toggleLeft)}
				</div>
            </aside>
            <main class={style.center}>
                {children}
            </main>
            <aside class={style.panel}
				style={{
					maxWidth: "250px",
					width: mediaRight ? "20%" : "30px"
				}}
			>
                {right}
				<div class={style.sideCtrl + style.right}>
				{renderButton(mediaRight ? ">" : "<", toggleRight)}
				</div>
            </aside>
        </div>
    );
}