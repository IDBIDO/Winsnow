

/******************* FASE1: OBJECT SEND REQUEST  ***********************/

import { logisticTaskName } from "./nameManagement";

    /* Fase1.1:  TASK REQUEST CREATION */
export function moveRequest(id: string, pos: [number, number], roomName: string): MoveRequest {

    const r: MoveRequest = {
        type: 'MOVE',
        source: {
            id: id, 
            pos: pos, 
            roomName: roomName
        }
    }
    return r;
}

export function transferRequest(id: string, resourceType: ResourceConstant ,amount: number): TransferRequest {

    const r: TransferRequest = {
        type: 'TRANSFER',
        target: {
            id: id, 
            resourceType: resourceType,
            amount: amount,
        }
    }
    return r;
}

export function withdrawRequest(id: string, roomName: string, pos:[number, number]): WithdrawRequest {
    const r: WithdrawRequest = {
        type: 'WITHDRAW',
        source: {
            id: id, 
            'roomName': roomName,
            'pos': pos
        }
    }
    return r;
}


    /************** Fase1.2. OBJECT: SEND TASK REQUEST ****************/

export function sendRequest(roomName: string ,dpt: string, creepName: string) {
    Memory['colony'][roomName][dpt]['request'].push(creepName);
}


/******************* FASE2. DEPARTMENT: SEND TASK TO OBJ_DEPARTMENT  ***********************/
    /* Fase2.1:  TASK CREATION */
export function task(request: TaskRequest) {

    const task: Task = {
        taskID: logisticTaskName(request),
        data: request
    }
    return task;
}

    /* Fase2.2:  SEND LOGISTIC TASK */
export function sendLogisticTask(roomName: string , taskName: string ,request: TaskRequest) {
    
    Memory['colony'][roomName]['dpt_logistic']['targetTask'][taskName] = request;
    
}

/** Game time to resend request */
export function getTTL(request: TaskRequest) {
    if (request.type == 'MOVE') return 12
}

/******************* FASE3. Creep: TASK REQUEST  ***********************/
export function sendTaskRequest(creepName: string, roomName: string) {
    Memory['colony'][roomName]['dpt_logistic']['requestCreep'].push(creepName);
}







///////////////////////////**** OPERATION RESERCH ****/////////////////////////
export function sendORBuildingTaskCompletation(roomName: string): void {
    Memory['colony'][roomName]['state']['buildColony']['task']['building'] = true;
}

export function sendORLevelUpTaskCompletation(roomName: string): void {
    Memory['colony'][roomName]['state']['buildColony']['task']['levelUp'] = true;
}

/*
export function sendBuildTask(roomName: string, constructionSideID: string, type: BuildableStructureConstant, pos: [number,number]):void {
    Memory['colony'][roomName]['dpt_build']['buildTask'][constructionSideID] = {
        'type': type,
        'pos': pos,
        'roomName': roomName

    }
    //actualize build cost
    const buildCost = Memory['colony'][roomName]['dpt_build']['buildCost'];
    Memory['colony'][roomName]['dpt_build']['buildCost'] = buildCost + CONSTRUCTION_COST[type];
    
}
*/

export function sendBuildTask(constructionSideID: string, data: BuildTask):void {
    Memory['colony'][data.roomName]['dpt_build']['buildTask'][constructionSideID] = data;


    //actualize build cost
    const buildCost = Memory['colony'][data.roomName]['dpt_build']['buildCost'];
    Memory['colony'][data.roomName]['dpt_build']['buildCost'] = buildCost + CONSTRUCTION_COST[data.type];
    
}






