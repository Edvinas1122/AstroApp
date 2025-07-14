import { useEffect, useRef, useState } from 'preact/hooks';
import style from './SidePannel.module.css';

interface SidePannelLayoutProps {
    left?: preact.ComponentChildren;
    children?: preact.ComponentChildren;
    right?: preact.ComponentChildren;
    class?: string;
}

function withTogglePannel() {
	const [media, setMedia] = useState(false);

	const scaleHandle = (ev: MediaQueryListEvent) => {
		setMedia(ev.matches);
	}

	useEffect(() => {
		const ob = window.matchMedia("(width > 820px)");
		setMedia(ob.matches); 
		ob.addEventListener('change', scaleHandle);
		return () => ob.removeEventListener('change', scaleHandle);
	}, [])

	const toggle = () => setMedia(!media)

	return {media, toggle}

}

const renderButton = (symbol: string, action: () => void) => <button
	class={style.cButton}
	onClick={action}
>
	{symbol}
</button>

export function SidePannelLayout({
	left,
	children,
	class: className = '',
}: SidePannelLayoutProps) {
	const {media, toggle} = withTogglePannel();

	return (
		<div class={`${style.layout} ${className}`}>
			<aside class={style.panel} 
				style={{
					maxWidth: "200px",
					width: media ? "20%" : "30px"
				}}
			>
				{left}
				<div class={style.sideCtrl}>
				{renderButton(media ? "<" : ">", toggle)}
				</div>
            </aside>
            <main class={style.center}>
                {children}
            </main>
        </div>
    );
}

interface RightPannelLayoutProps {
    right?: preact.ComponentChildren;
    children?: preact.ComponentChildren;
    class?: string;
}

export function RightPannelLayout({
	right,
	children,
	class: className = '',
}: RightPannelLayoutProps) {

	const { media, toggle } = withTogglePannel();

	return (
		<div class={`${style.layout} ${className}`}>
			<main class={style.center}>
				{children}
			</main>
			<aside class={style.panel}
				style={{
					maxWidth: "250px",
					width: media ? "20%" : "30px"
				}}
			>
				{right}
				<div class={`${style.sideCtrl} ${style.right}`}>
					{renderButton(media ? ">" : "<", toggle)}
				</div>
			</aside>
		</div>
	);
}