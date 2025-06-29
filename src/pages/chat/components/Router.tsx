import { useEffect } from "preact/hooks"
import {route} from "../../../chatStore"

interface VirtualRouterProps {
	children: ChildNode
}

function VirtualRouter({ children }: VirtualRouterProps) {
	useEffect(() => {
		const location = () => window.location.pathname.split('/')
			.filter(segment => segment.length)
			.map(decodeURIComponent)
		route.set(location())
		const originalPushState = window.history.pushState;

		window.history.pushState = function (...args) {
			originalPushState.apply(this, args);
			console.log(location())
			route.set(location());
		};

		const handlePopState = () => {
			route.set(location());
		};
		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
			window.history.pushState = originalPushState; // Restore original pushState
		};
	}, []);

	return <>{children}</>;
}

export {VirtualRouter}