import { type SafeResult } from "astro:actions";


function handleResult<T>(result: SafeResult<any, any>) {
    console.log('before')
    if (result.error) {
        console.log('error occured');
        throw new Error("failed to fetch:", result.error);
    }
    console.log('after', result);
    return result.data as T;
}

function onSuccess<T, RET>(handler: (data: T) => RET) {
    return (result: SafeResult<any, any>) => {
        const data = handleResult(result);
        return handler(data as T);
    }
}

export {onSuccess, handleResult}