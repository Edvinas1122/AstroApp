import { h } from 'preact';
import style from './Material.module.css';
import { useRef, useEffect } from 'preact/hooks';

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
		<>
			{props.header}
			<button onClick={close}>X</button>
		</>
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