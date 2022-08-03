
export function callSourceTransporter(creep: Creep) {
    let memory = Memory['colony'][creep.memory['roomName']]['dpt_logistic']['sourceTask'];
    const sourceTaskName = randomLogisticTaskName();    
    memory[sourceTaskName] = {};

    const logSourceTask: LogisticSourceTask = {
        id: creep.id,
        roomName: creep.room.name,
        pos: [creep.pos.x, creep.pos.x]
    }
    
    
    memory[sourceTaskName] = logSourceTask;
}

export function randomLogisticTaskName() {
    return ('LOG' + Math.random().toString(36).substr(2,7));
}