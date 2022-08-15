
export function logisticTaskName(request: TaskRequest) {
     //return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
    return (request.type + Math.random().toString(36).substr(2,7));
}

export function creepName() {
    return Math.random().toString(36).substr(2,9).toLocaleUpperCase()
}

export function requestName() {
    return (Math.random().toString(36).substr(2,6))
}
