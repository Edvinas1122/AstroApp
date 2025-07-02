import { useEffect } from "preact/hooks"
import {route} from "../../../chatStore"

interface VirtualRouterProps {
	children: ChildNode
}

function withRouter() {
	useEffect(() => {
		const location = () => window.location.pathname.split('/')
			.filter(segment => segment.length)
			.map(decodeURIComponent)
		route.set(location())

		const originalPushState = window.history.pushState;
		const originalReplaceState = window.history.replaceState;

		window.history.pushState = function (...args) {
			originalPushState.apply(this, args);
			route.set(location());
		};

		window.history.replaceState = function (...args) {
			originalReplaceState.apply(this, args);
			route.set(location());
		}

		const handlePopState = () => {
			route.set(location());
		};
		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
			window.history.pushState = originalPushState;
			window.history.replaceState = originalReplaceState;
		};
	}, []);
}

function withFetchRedirect() {
	useEffect(() => {
		const originalFetch = window.fetch;

		window.fetch = async (...args) => {
			const response = await originalFetch(...args);

			if (response.status === 401) {
				window.location.href = '/auth';
			}

			return response;
		};
		return () => window.fetch = originalFetch;
	}, [])
}

function VirtualRouter({ children }: VirtualRouterProps) {

	withRouter();
	withFetchRedirect();

	return <>{children}</>;
}

export {VirtualRouter}