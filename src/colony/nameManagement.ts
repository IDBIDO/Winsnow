export function taskName(request: TaskRequest) {
     //return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
    return (request.type + Math.random().toString(36).substr(2,9));
}