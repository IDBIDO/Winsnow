import {Colony} from "./Colony"

global.ColonyApi = {
    createColony(roomName: string) : string{
        const col1 = new Colony(roomName);
        col1.initializeMem();
        //col1.updateSpawnTask();

        return "Colony " + roomName + " created."
    },

    generateCreep(roomName: string, role: string) {
        
    }
    

}

export function nothing(){
    return "nothinf"
}

export {};