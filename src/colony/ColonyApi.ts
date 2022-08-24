import { OperationReserch } from "@/operationResearch/OperationReserch";
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
    },

    destroyAllBuilding(roomName: string) {
        const building = Game.rooms[roomName].find(FIND_STRUCTURES, 
        {filter: (structure)=> structure.structureType != 'spawn'}    
        )
        for (let i = 0; i < building.length; ++i) {
            building[i].destroy();
        }

    },

    constructAdjacentRoad(roomName: string, pos: [number, number]) {
        const a = new OperationReserch(roomName);
        a.constructAdjacentRoad(pos);
    }

}




export function nothing(){
    return "nothinf"
}

