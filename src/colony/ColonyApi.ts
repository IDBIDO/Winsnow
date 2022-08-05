import {Colony} from "./Colony"

global.ColonyApi = {
    createColony(roomName: string) : string{
        const col1 = new Colony(roomName);
        col1.initializeMem();
        //col1.updateSpawnTask();

        return "Colony " + roomName + " created."

        /*
        let request: LogisticTaskRequest = {
            type: 'MOVE',
            data: {
                id: 'sss',
                pos: [1,2],
                roomName: 'dddd'
            }
        }
        */
    },

    sendTaskRequest(roomName: string ,dpt: string, request: TaskRequest) {
        Memory['colony'][roomName][dpt]['request'].push(request);
    }
    

}




export function nothing(){
    return "nothinf"
}

