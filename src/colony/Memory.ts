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
        colonyMem['state']['updateCreepNum'] = true;
        colonyMem['state']['updateCreepNumWorker'] = true;
        
        colonyMem['state']['updateCreepNum'] = 1;
        //save roomPlaning Block
        let planning: TranslatePlanning = new TranslatePlanning(this.mainRoom);
        planning.savePlanningModel();

        colonyMem['creepSpawning'] = {};
        colonyMem['creepSpawning']['spawn'] = [];
        colonyMem['creepSpawning']['task'] = {};
        colonyMem['creepSpawning']['completeTask'] = {};


        this.initializeDptHarvest();
        this.initializeDptLogistic();
        this.initializeDptWork();

        

    }
    
    private initializeDptLogistic() {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['dpt_logistic'] = {};
        colonyMem['dpt_logistic']['state'] = '';

        colonyMem['dpt_logistic']['request'] = [];
        
        colonyMem['dpt_logistic']['sourceTask'] = {};
        colonyMem['dpt_logistic']['targetTask'] = {};

        colonyMem['dpt_logistic']['creep'] = {};
        colonyMem['dpt_logistic']['ticksToSpawn'] = {};
    }

    private initializeDptHarvest() {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['dpt_harvest'] = {};
        
        //harvesters collect energy request 
        colonyMem['dpt_harvest']['request'] = [];



        colonyMem['dpt_harvest']['creep'] = {};
            //'id': [Pos1, Pos2, Pos3...]
        colonyMem['dpt_harvest']['ticksToSpawn'] = {};
    }

}