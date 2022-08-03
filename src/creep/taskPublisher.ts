
export function callSourceTransporter(id: string, mainRoom: string) {
    let memory = Memory['colony'][mainRoom]['dpt_logistic']['sourceTask'];
    const sourceTaskName = randomLogisticTaskName();    
    memory[sourceTaskName] = {};

    const logSourceTask: LogisticSourceTask = {
        id: id,
        room: mainRoom
    }
    
    
    memory[sourceTaskName] = logSourceTask;
}

export function randomLogisticTaskName() {
    return ('LOG' + Math.random().toString(36).substr(2,7));
}