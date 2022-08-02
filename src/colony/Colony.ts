import {Mem} from "./Memory"
import Dpt_Work from "@/department/dpt_work/Dpt_Work";
import { CreepSpawning } from "@/structure/CreepSpawning";
import Dpt_harvest from "@/department/dpt_harvest/Dpt_harvest";


/** 
    Ocupa de ejecutar todas las acciones de una colonia
    y la comunicacion intercolonial
*/
export class Colony {

    mainRoom: string;  //main roomName
    /* Colony property */
    //dpt_work: Dpt_Work;
    //creepSpawning: CreepSpawning;

    constructor(mainRoom: string) {
        this.mainRoom = mainRoom;
        //this.memory = new Mem(mainRoom);
        //this.dpt_work = new Dpt_Work(mainRoom);
        //this.creepSpawning = new CreepSpawning(mainRoom);
    }



    //initialize colony Memory
    public initializeMem(): void {
        const memory = new Mem(this.mainRoom);
        memory.initializeColonyMem();
    }




    public run() {
        //const dpt_work = new Dpt_Work(this.mainRoom);
        //const creepSpawning = new CreepSpawning(this.mainRoom);
        //dpt_work.run();
        
        //creepSpawning.run();
        
        const dpt_harvest = new Dpt_harvest(this.mainRoom);
        dpt_harvest.run();
    }
    
}


//Memory['colony']['W6N8']['creepSpawning']['spawn'].push('Spawn1')
//ColonyApi.createColony('W7N9')

//Memory['colony']['W7N7']['dpt_work']['ticksToSpawn']['W7N7_dptWork_1'] = Game.time + 10;