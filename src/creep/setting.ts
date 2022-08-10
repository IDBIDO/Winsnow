export const energyAvailable = [300, 550, 800, 1300, 1800, 2300, 5600, 10000]



export function getEnergyRCL(energyAmount: number): number {

    let found = false;
    let i = 0;
    while( !found && i < 8) {
        if (energyAmount <= energyAvailable[i]) return i+1;
        ++i;
    }
    return -1;
}

export function getBody(role: string, rcl: number): BodyPartConstant[] {

    let prototype: BodyPartConstant[] = bodyPrototype[role];
    
    const componentNum = bodyComponentNum[role][rcl];
    let act: BodyPartConstant[] = [];
    for (let i in prototype) {
        for (let j = 0; j < componentNum[i]; ++j ) {
            act.push(prototype[i]);
        }
    }
    return act;
}

export function getQueenBody(){

}

export function ticksToSpawn(role: string, rcl: number): number {
    const componentNum:number[] = bodyComponentNum[role][rcl.toString()];
    const ticks:number = componentNum.reduce((x, y) => x + y, 0)
    return ticks*3
}



export const bodyPrototype = {
    harvester: [WORK, CARRY, MOVE],
    worker: [WORK, CARRY, MOVE],
    transporter: [CARRY, MOVE],
    initializer: [WORK, CARRY, MOVE],
    iniQueen: [CARRY, MOVE]
}


export const bodyComponentNum = {
    //WORK  CARRY   MOVE
    harvester:{
        1: [2, 1, 1],
        2: [4, 1, 2]
    },

    worker: {
        1: [1, 1, 1],
        2: [2, 2, 2]
    },

    transporter: {
        1: [2, 2],
        2: [3, 2]
    },

    initializer: {
        1: [2, 1, 1]
    },
    iniQueen: {
        1: [1, 1],
    }

}

export const bodyConfigs = {
    harvester:{
        1: {WORK: 2, CARRY: 1, MOVE: 1},
        2: {WORK: 4, CARRY: 1, MOVE: 2}
    },

    worker: {
        1: {"work": 1, "carry": 1, "move": 1},
        2: {WORK: 2, CARRY: 2, MOVE: 2}
    },

    transporter: {
        1: {CARRY: 3, MOVE: 3},
        2: {CARRY: 3, MOVE: 3}
    }
  
}

export const numConfigs = {
    1: {
        harvester: 2,
        worker: 2
    }
}

export function workerSourceConfigUpdate(energyRCL: number, roomName: string): void {
    console.log(energyRCL);
    
    if (energyRCL == 1) {
        const colonyMem = Memory['colony'][roomName];
        const namePrefix = roomName;

        const sourcePos = colonyMem['roomPlanning']['model']['source'];
        const source1 = sourcePos[0];
        const source2 = sourcePos[1];

        const source1Pos = new RoomPosition(source1[0], source1[1], roomName);
        const source2Pos = new RoomPosition(source2[0], source2[1], roomName);

        const s1 = source1Pos.lookFor(LOOK_SOURCES);
        const s2 = source2Pos.lookFor(LOOK_SOURCES);

        console.log(s1);
        
        colonyMem['dpt_work']['creep'][namePrefix+'_dptWork_1']['setting']['source'] = s1[0].id;

        colonyMem['dpt_work']['creep'][namePrefix+'_dptWork_2']['setting']['source'] = s2[0].id;
    }
}

export function workerConfigUpdate(roomName: string, dptName: string, energyRCL: number,): void {
    
    if (energyRCL == 1) {
        const source1id = Memory['colony'][roomName]['roomPlanning']['model']['source']['energy1'];
        const source2id = Memory['colony'][roomName]['roomPlanning']['model']['source']['energy2'];

        const creepsMem = Memory['colony'][roomName][dptName]['creep'];
        let creepNameList = Array<string>();
        for (let creepName in creepsMem) {
            creepNameList.push(creepName);
        }
        
        creepsMem[creepNameList[0]]['source'] = source1id;
        creepsMem[creepNameList[1]]['source'] = source2id;
    }
}



export function updateCreepSetting( roomName: string,  dptName: string, energyRCL: number) {
    switch (dptName) {
        case 'dpt_work': 
            workerConfigUpdate(roomName, dptName, energyRCL);
            break;

        case 'dpt_harvest':
            break;

        default:
            console.log('Department name incorrect !');
            
    }
    
}


