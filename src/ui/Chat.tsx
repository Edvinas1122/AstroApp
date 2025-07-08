import type { FormEvent } from "preact/compat";
import styles from "./Chat.module.css"
import type { VNode } from "preact";
import { useState } from "preact/hooks";


interface ListBoxProps {
	header?: VNode | string;
	children?: VNode | VNode[];
	footer?: VNode;
	class?: string;
	width?: string
}

export const ListBox = ({ header, children, footer, class: className = '', width }: ListBoxProps) => (
	<div class={`${styles.msger} ${className}`} 
		style={{
			maxWidth: width
		}}
	>
		{header && (
			<header class={styles.msgerHeader}>
				{typeof header === 'string' ? (
					<div class={styles.msgerHeaderTitle}>
						{header}
					</div>
				) : (
					header
				)}
			</header>
		)}
		<main class={styles.msgerChat}>
			{children}
		</main>
		{footer && (
			<footer class={styles.msgerInputArea}>
				{footer}
			</footer>
		)}
	</div>
);

type ChatUserMiniReq = {
	online: boolean | undefined,
	picture: {
		url: string,
		alt: string
	},
	name: string,
}

export const ChatUserMini = ({
	online, picture, name, children
}: ChatUserMiniReq & {children?: VNode}) => (
  <div style={{
	display: 'flex',
	alignItems: 'center',
	gap: '10px',
	padding: '5px 0'
  }}>
	<div style={{ position: 'relative' }}>
	  <img
		src={picture.url}
		alt={picture.alt}
		style={{
		  height: '30px',
		  width: '30px',
		  borderRadius: '100%',
		  objectFit: 'cover'
		}}
	  />
	  {/* Online Indicator Dot */}
	  <span style={{
		position: 'absolute',
		bottom: 0,
		right: 0,
		width: '8px',
		height: '8px',
		borderRadius: '50%',
		backgroundColor: online ? 'limegreen' : 'gray',
		border: '1px solid white'
	  }} />
	</div>

	{/* Name and optional children */}
	<div>
	  <div>{name}</div>
	  {children}
	</div>
  </div>
);


type MessageProps = {
	name: string,
	picture: string,
	sent: string,
	content: string,
	my: boolean,
	file?: {type: "image" | "video", url: string} | null
}

const _file = {
	image: (url: string) => <img src={url} alt="Selected file preview" className={styles.previewImage} />,
	video: (url: string) => <video src={url} controls className={styles.previewImage} />,
};

function pickType(type: keyof typeof _file) {
	if (type.startsWith("image")) {
		return _file.image
	} else if (type.startsWith("video")) {
		return _file.video
	} else {
		console.error("unknown type", type);
		return () => (<>error type</>)
	}
}

export const MessageBox = ({ name, picture, sent, content, my, file }: MessageProps) => (
	<div className={`${styles.msg} ${my ? styles.rightMsg : styles.leftMsg}`}>
		<img
			class={styles.msgImg}
			src={picture}
			alt={name}
		/>
		<div className={styles.msgBubble}>
			<div class={styles.msgInfo}>
				<div class={styles.msgInfoName}>{name}</div>
				<div class={styles.msgInfoTime}>{sent}</div>
			</div>
			{file && pickType(file.type)(file.url)}
			<div class={styles.msgText}>{content}</div>
		</div>
	</div>
);

type WritingAreaProps = {
	onSubmit: (e: FormEvent) => void,
	submit: (form: HTMLFormElement) => void,
}

export const WritingArea = ({
	submit,
	onSubmit,
}: WritingAreaProps) => {

	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const adjustHeight = (e: Event) => {
		const textarea = e.target as HTMLTextAreaElement;
		textarea.style.height = 'auto';
		textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
	};

	const onFileChange = (event: Event) => {
		const input = event.target as HTMLInputElement;
		const file = input.files ? input.files[0] : null;
		
		if (file && file.type.startsWith('image/')) {
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
		} else {
			clearPreview();
		}
	};

	const clearPreview = () => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
		}
	};

	const renderPreview = (url: string) => (
        <div className={styles.previewContainer}>
          <img src={url} alt="Selected file preview" className={styles.previewImage} />
          <button
            type="button"
            className={styles.clearPreviewBtn}
            onClick={clearPreview}
            title="Remove image"
          >
            ×
          </button>
        </div>
	)

	const onStroke = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			const form = (e.target as HTMLTextAreaElement).form;
			submit(form as HTMLFormElement);
		}
	};

	return (
		<form className={styles.msgerInputarea} onSubmit={onSubmit} onReset={clearPreview}>
			<label className={styles.fileButton}>
				{previewUrl && renderPreview(previewUrl)}
				<span className={styles.fileIcon}>📎</span>
				<input
					type="file"
					name="attachment"
					accept="image/*,application/pdf"
					className={styles.fileInput}
					onChange={onFileChange}
				/>
			</label>
			<textarea name="content" placeholder="Enter your message..." 
				className={styles.msgerInput}
				onKeyDown={onStroke}
				onInput={adjustHeight}
			/>
			<button
				className={styles.msgerSendBtn}
			>Send</button>
		</form>
	)
}