import { type SafeResult } from "astro:actions";


function handleResult<T>(result: SafeResult<any, any>) {
    if (result.error) {
        throw new Error("failed to fetch:", result.error);
    }
    return result.data as T;
}

function onSuccess<T, RET>(handler: (data: T) => RET) {
    return (result: SafeResult<any, any>) => {
        const data = handleResult(result);
        return handler(data as T);
    }
}

export {onSuccess, handleResult}