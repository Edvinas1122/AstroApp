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

	const [media, setMedia] = useState(false);

	const scaleHandle = (ev: MediaQueryListEvent) => {
		console.log('scale trigger :)', ev.matches);
		setMedia(ev.matches);
	}

	useEffect(() => {
		const ob = window.matchMedia("(width > 720px)");
		setMedia(ob.matches);
		ob.addEventListener('change', scaleHandle);
		return () => ob.removeEventListener('change', scaleHandle);
	}, [])

	return (
		<div class={`${style.layout} ${className}`}>
			<aside class={style.panel} 
				style={{
					width: media ? "24%" : "30px"
				}}
			>
				{left}
            </aside>
            <main class={style.center}>
                {children}
            </main>
            <aside class={style.panel}>
                {right}
            </aside>
        </div>
    );
}