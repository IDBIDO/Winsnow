import {Colony} from "./Colony"

global.ColonyApi = {
    createColony(roomName: string) : string{
        const col1 = new Colony(roomName);
        col1.initializeMem();
        //col1.updateSpawnTask();

        return "Colony " + roomName + " created."


    },
    deleteColony(roomName: string):string {
        delete Memory['colony'][roomName];
        return "Colony " + roomName + " deleted" ;
    },

    sendTaskRequest(roomName: string ,dpt: string, request: TaskRequest) {
        Memory['colony'][roomName][dpt]['request'].push(request);
    },
    

    //************* DEBUG ************** */
    setWorkingFaseToFalse(roomName: string) {
        Memory['colony'][roomName]['state']['buildColony']['working'] = false;
    }

}




export function nothing(){
    return "nothinf"
}

