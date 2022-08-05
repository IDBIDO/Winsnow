

/******************* FASE1: START COMUNICATION  ***********************/

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

export function sendTaskRequest(roomName: string ,dpt: string, request: TaskRequest) {
    Memory['colony'][roomName][dpt]['request'].push(request);
}


/******************* FASE2: DEPARTMENT SEND TASK  ***********************/
    /* Fase2.1:  TASK CREATION */
export function task(request: TaskRequest) {

    const task: Task = {
        taskID: taskName(request),
        data: request
    }
    return task;
}

    /* Fase2.2:  SEND TASK */
export function sendTask(roomName: string ,dpt: string, task: Task) {
    Memory['colony'][roomName][dpt]['task']
}





