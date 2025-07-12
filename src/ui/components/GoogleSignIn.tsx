import style from "./GoogleSing.module.css"

const GoogleSignInButton = ({ href }: {href: string}) => {
  return (
    <a
      href={href}
	  className={style.googleBtn}
    //   style={}
    >
      <svg
        style={{ marginRight: '8px' }}
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 48 48"
      >
        <path fill="#EA4335" d="M24 9.5c3.4 0 6.4 1.2 8.8 3.1l6.5-6.5C34.8 2.5 29.7 0 24 0 14.6 0 6.7 5.8 3.1 14.1l7.9 6.2C12.7 14.1 17.9 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.8-.4-4H24v8.1h12.7c-.6 3.4-2.4 6.3-5.2 8.2l7.9 6.2c4.6-4.2 7.1-10.3 7.1-18.3z" />
        <path fill="#FBBC05" d="M10.9 28.3c-.5-1.5-.8-3.2-.8-4.8s.3-3.3.8-4.8L3 12.5C1 16 0 20 0 24s1 8 3 11.5l7.9-6.2z" />
        <path fill="#34A853" d="M24 48c5.7 0 10.8-1.9 14.3-5.3l-7.9-6.2c-2 1.4-4.5 2.3-7.4 2.3-6.1 0-11.3-4.6-12.9-10.6l-7.9 6.2C6.7 42.2 14.6 48 24 48z" />
      </svg>
      Sign in with Google
    </a>
  );
};

export default GoogleSignInButton;
