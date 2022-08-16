import {Mem} from "./Memory"
import Dpt_build from "@/department/dpt_build/Dpt_Build";
import { CreepSpawning } from "@/structure/CreepSpawning";
import Dpt_harvest from "@/department/dpt_harvest/Dpt_Harvest";
import { OperationReserch } from "@/operationResearch/OperationReserch";
import Dpt_Logistic from "@/department/dpt_logistic/Dpt_Logistic";
import { ControllerOrder } from "@/structure/ControllerOrder";


/** 
    Ocupa de ejecutar todas las acciones de una colonia
    y la comunicacion intercolonial
*/
export class Colony {

    mainRoom: string;  //main roomName
    /* Colony property */
    //dpt_build: dpt_build;
    //creepSpawning: CreepSpawning;

    constructor(mainRoom: string) {
        this.mainRoom = mainRoom;
        //this.memory = new Mem(mainRoom);
        //this.dpt_build = new dpt_build(mainRoom);
        //this.creepSpawning = new CreepSpawning(mainRoom);
    }



    //initialize colony Memory
    public initializeMem(): void {
        const memory = new Mem(this.mainRoom);
        memory.initializeColonyMem();
    }




    public run() {
        const operationResearch = new OperationReserch(this.mainRoom);
        operationResearch.run();

        const dpt_harvest = new Dpt_harvest(this.mainRoom);
        //dpt_harvest.run();

        const dpt_logistic = new Dpt_Logistic(this.mainRoom);
        dpt_logistic.run();

        const creepSpawning = new CreepSpawning(this.mainRoom);
        creepSpawning.run();

        const controller = new ControllerOrder(this.mainRoom);
        controller.run();
    }
    
}


//Memory['colony']['W7N9']['creepSpawning']['spawn'].push('Spawn1')
//ColonyApi.createColony('W7N9')
//ColonyApi.deleteColony('W7N9')
//Memory.creeps = {}

//Memory['colony']['W7N7']['dpt_build']['ticksToSpawn']['W7N7_dptWork_1'] = Game.time + 10;