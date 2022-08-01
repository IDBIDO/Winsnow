import { TranslatePlanning } from "@/roomPlanning/TranslatePlanning";



/*
Memory.colony.
        mainRoom.
            state{}
            roomPlanning{}
            dpt_work{}
*/

/*
    Colony's memory block inizializer.
    Only when create a new colony
*/

export class Mem {
    mainRoom: string;

    constructor(roomName: string) {
        this.mainRoom = roomName;
        //this.build();
    }


    
    private initializeWorkerCreepsMem():void {

        //initialize dpt_workers creeps
        const colonyMem = Memory['colony'][this.mainRoom];
        const namePrefix = this.mainRoom;
        colonyMem['dpt_work']['creep'][namePrefix+'_dptWork_1'] = {};
        colonyMem['dpt_work']['creep'][namePrefix+'_dptWork_1']['active'] = false;
        colonyMem['dpt_work']['creep'][namePrefix+'_dptWork_1']['setting'] = {};

        colonyMem['dpt_work']['creep'][namePrefix+'_dptWork_2'] = {};
        colonyMem['dpt_work']['creep'][namePrefix+'_dptWork_2']['active'] = false;
        colonyMem['dpt_work']['creep'][namePrefix+'_dptWork_2']['setting'] = {};
    }

    private initializeDptWork():void {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['dpt_work'] = {};
        colonyMem['dpt_work']['creep'] = {};
        colonyMem['dpt_work']['buildTask'] = [];
        colonyMem['dpt_work']['repairTask'] = [];
        colonyMem['dpt_work']['ticksToSpawn'] = {};
        this.initializeWorkerCreepsMem();
    }

    /*
        request mem for a new colony
    */
    public initializeColonyMem(): void {
        delete Memory['colony'][this.mainRoom]

        Memory['colony'][this.mainRoom] = {};
        const colonyMem = Memory['colony'][this.mainRoom];

        colonyMem['state'] = {};
        colonyMem['state']['currentRCL'] = 1;
        colonyMem['state']['updateRoomPlanning'] = true;
        colonyMem['state']['updateCreepNumWorker'] = true;
        
        colonyMem['state']['updateCreepNum'] = 1;
        //save roomPlaning Block
        let planning: TranslatePlanning = new TranslatePlanning(this.mainRoom);
        planning.savePlanningModel();

        colonyMem['creepSpawning'] = {};
        colonyMem['creepSpawning']['spawn'] = [];
        colonyMem['creepSpawning']['task'] = {};
        colonyMem['creepSpawning']['completeTask'] = {};

        
        this.initializeDptWork();

        

    }
    


}