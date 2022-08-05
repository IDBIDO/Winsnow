

/******************* FASE1: OBJECT SEND REQUEST  ***********************/

import { taskName } from "./nameManagement";

    /* Fase1.1:  TASK REQUEST CREATION */
export function moveRequest(id: string, pos: [number, number], roomName: string): MoveRequest {

    const r: MoveRequest = {
        type: 'MOVE',
        id: id, 
        pos: pos, 
        roomName: roomName
        
    }
    return r;
}

export function transferRequest(id: string, resourceType: ResourceConstant ,amount: number): TransferRequest {

    const r: TransferRequest = {
        type: 'TRANSFER',
        id: id, 
        resourceType: resourceType,
        amount: amount,
        
    }
    return r;
}

export function withdrawRequest(id: string, resourceType: ResourceConstant): WithdrawRequest {
    const r: WithdrawRequest = {
        type: 'WITHDRAW',
        id: id, 
        resourceType: resourceType
    }
    return r;
}


    /************** Fase1.2: SEND TASK REQUEST ****************/

export function sendRequest(roomName: string ,dpt: string, creepName: string) {
    Memory['colony'][roomName][dpt]['request'].push(creepName);
}


/******************* FASE2. DEPARTMENT: SEND TASK  ***********************/
    /* Fase2.1:  TASK CREATION */
export function task(request: TaskRequest) {

    const task: Task = {
        taskID: taskName(request),
        data: request
    }
    return task;
}

    /* Fase2.2:  SEND LOGISTIC TASK */
export function sendLogisticTask(roomName: string , taskName: string ,request: TaskRequest) {
    
    if (request.type == 'MOVE' || request.type == 'WITHDRAW') {
        Memory['colony'][roomName]['dpt_logistic']['sourceTask'][taskName] = request;
    }
    else {
        Memory['colony'][roomName]['dpt_logistic']['targetTask'][taskName] = request;

    }
}

/** Game time to resend request */
export function getTTL(request: TaskRequest) {
    if (request.type == 'MOVE') return 12
}

/******************* FASE3. Creep: TASK REQUEST  ***********************/
export function sendTaskRequest(creepName: string, roomName: string) {
    Memory['colony'][roomName]['dpt_logistic']['requestCreep'].push(creepName);
}




