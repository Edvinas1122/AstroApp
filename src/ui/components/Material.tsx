import { h } from 'preact';
import style from './Material.module.css';
import { useRef, useEffect, useState } from 'preact/hooks';
import type { ComponentChild, JSX, VNode } from 'preact';

interface CardProps {
    header?: preact.ComponentChildren;
    children?: preact.ComponentChildren;
    footer?: preact.ComponentChildren;
    class?: string;
    width?: string;
}

export function Card({
    header,
    children,
    footer,
    class: className = '',
    width = '400px'
}: CardProps) {
    return (
        <section 
            class={`${style.card} ${className}`}
            style={{ maxWidth: width }}
        >
            {header && <div class={style.cardHeader}>
                {header}
            </div>}
            
            <div class={style.cardContent}>
                {children}
            </div>
            
            {footer && <div class={style.cardFooter}>
                {footer}
            </div>}
        </section>
    );
}

interface ModalProps extends CardProps {
    isOpen: boolean,
    close: () => void
}

export function Modal({
	isOpen,
    close,
	...props
}: ModalProps) {
    const backgroundRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isOpen) {
				close();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, close]);

	const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.target === backgroundRef.current) {
			close();
		}
	};

	const Headers = () => (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
    			justifyContent: "space-between"
			}}
		>
			{props.header}
			<button
				onClick={close}
				class={style.circleBtn}
				style={{height: "23px", width: "23px"}}
			>X</button>
		</div>
	);
	return (
	<>
		{isOpen && (
			<div
				onClick={handleBackgroundClick}
                ref={backgroundRef}
                className={style.modalBackground}>
				<Card
					{...props}
					header={<Headers/>}
				/>
			</div>
	    )}
	</>	
	);
}

interface CenterProps extends JSX.HTMLAttributes<HTMLDivElement> {
	children: VNode
}

export const Center = ({children, ...props}: CenterProps) => (
	<div
		{...props}
		class={style.center}>
		{children}
	</div>
);

interface ProfileProps extends JSX.HTMLAttributes<HTMLImageElement> {
	src: string,
	alt: string
}

export const Profile = ({...props}: ProfileProps) => (
	<img
		{...props}
		class={style.profile}
	/>
)

interface CircleButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
	children: VNode,
} 

export const Button = ({children, ...props}: CircleButtonProps) =>
	<button {...props} class={style.button}>
		{children}
	</button>

// interface CircleButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
// 	children: VNode,
// } 

// export const CircleButton = ({children, ...props}: CircleButtonProps) =>
// 	<button {...props} class={style.circleBtn}>
// 		{children}
// 	</button>

interface RoomTabletProps extends JSX.HTMLAttributes<HTMLDivElement> {
	children: ComponentChild,
	interf?: VNode,
	selected?: boolean
}

export function OptionsTablet({
	children, interf, selected, ...props
}: RoomTabletProps) {
	const [options, setOptions] = useState<{state: boolean, timer?:  NodeJS.Timeout}>({
		state: false,
	});

	const hide = () => {
		const timer = setTimeout(() => {
			setOptions({
				state: false,
			})
		}, 130);
		setOptions({state: true, timer})
	}

	const show = () => {
		clearTimeout(options.timer);
		setOptions({state: true})
	}

	const toggle = (e: Event) => {
		e.stopPropagation();
		setOptions({state: !options.state});
	}

	return (
		<div {...props}
			class={`${style.tablet} ${selected && style.selected}`}
		>
			{children}
			{interf && <>
			<button onClick={toggle}
				onMouseEnter={show}
				onMouseLeave={hide}
				class={style.circleBtn} style={{height: "25px", width: "25px"}}>
				<>˅</>
			</button>
			{options.state && <div class={style.pop} onMouseEnter={show}
				onMouseLeave={hide}
			>
			{interf}
			</div>}</>}
		</div>
	)
}

interface OptionProps extends JSX.HTMLAttributes<HTMLDivElement> {
	label?: string;
	icon?: string;
	disabled: boolean;
	onClick: (e: Event) => void
	// children: ComponentChild;
}

export function Option({ disabled, label = "Delete", icon = "🗑︎", ...props }: OptionProps) {
	const click = (e: Event) => {e.stopPropagation(), props.onClick(e)}
	return (
		<div {...props} class={style.option} onClick={click}>
			<p>{label}</p>
			<label style={{cursor: "pointer"}}>
				{icon}
			</label>
		</div>
	);
}