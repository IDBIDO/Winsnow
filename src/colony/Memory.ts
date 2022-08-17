import { TranslatePlanning } from "@/roomPlanning/TranslatePlanning";



/*
Memory.colony.
        mainRoom.
            state{}
            roomPlanning{}
            dpt_build{}
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

        //initialize dpt_builders creeps
        const colonyMem = Memory['colony'][this.mainRoom];
        const namePrefix = this.mainRoom;
        colonyMem['dpt_build']['creep'][namePrefix+'_dptWork_1'] = {};
        colonyMem['dpt_build']['creep'][namePrefix+'_dptWork_1']['active'] = false;
        colonyMem['dpt_build']['creep'][namePrefix+'_dptWork_1']['setting'] = {};

        colonyMem['dpt_build']['creep'][namePrefix+'_dptWork_2'] = {};
        colonyMem['dpt_build']['creep'][namePrefix+'_dptWork_2']['active'] = false;
        colonyMem['dpt_build']['creep'][namePrefix+'_dptWork_2']['setting'] = {};
    }



    /*
        request mem for a new colony
    */
    public initializeColonyMem(): void {
        if (! Memory['colony']) {
            Memory['colony'] = {}
        }
        delete Memory['colony'][this.mainRoom]

        Memory['colony'][this.mainRoom] = {};
        const colonyMem = Memory['colony'][this.mainRoom];

        colonyMem['state'] = {};
        colonyMem['state']['buildColony'] = {}

        colonyMem['state']['buildColony']['buildRCL'] = 0;
        colonyMem['state']['buildColony']['fase'] = 0;
        colonyMem['state']['buildColony']['working'] = false;
        colonyMem['state']['buildColony']['task'] = {}
        colonyMem['state']['buildColony']['task']['building'] = false;
        colonyMem['state']['buildColony']['task']['levelUP'] = false;
        
        colonyMem['state']['import'] = {}

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

        colonyMem['state']['controller'] = {};
        colonyMem['state']['controller']['fillTaskTTL'] = -1;

        this.initializeDptHarvest();
        this.initializeDptLogistic();
        this.initializeDptWork();

        

    }
    
    private initializeDptLogistic() {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['dpt_logistic'] = {};
        colonyMem['dpt_logistic']['storage'] = [];

        colonyMem['dpt_logistic']['fillTask'] = false;

        colonyMem['dpt_logistic']['request'] = [];
        
        colonyMem['dpt_logistic']['sourceTask'] = {};
        colonyMem['dpt_logistic']['targetTask'] = {};

        colonyMem['dpt_logistic']['creep'] = {};
        colonyMem['dpt_logistic']['ticksToSpawn'] = {};

        colonyMem['sourceContainer'] = [];
        colonyMem['controllerContainer'] = [];
    }

    private initializeDptHarvest() {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['dpt_harvest'] = {};


        colonyMem['dpt_harvest']['source1'] = {};
        colonyMem['dpt_harvest']['source1']['id'] = '';
        colonyMem['dpt_harvest']['source1']['outRampart'] = true;
        colonyMem['dpt_harvest']['source1']['creeps'] = [];

        colonyMem['dpt_harvest']['source2'] = {};
        colonyMem['dpt_harvest']['source2']['id'] = '';
        colonyMem['dpt_harvest']['source2']['outRampart'] = true;
        colonyMem['dpt_harvest']['source2']['creeps'] = [];

        colonyMem['dpt_harvest']['mineral'] = {};
        colonyMem['dpt_harvest']['mineral']['id'] = '';
        colonyMem['dpt_harvest']['mineral']['outRampart'] = true;
        colonyMem['dpt_harvest']['mineral']['creeps'] = [];
        
        colonyMem['dpt_harvest']['creep'] = {};
        colonyMem['dpt_harvest']['ticksToSpawn'] = {};
    }

    private initializeDptWork():void {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['dpt_build'] = {};
        colonyMem['dpt_build']['creep'] = {};
        colonyMem['dpt_build']['ticksToSpawn'] = {};
        colonyMem['dpt_build']['buildCost'] = 0;
        colonyMem['dpt_build']['buildTask'] = {};
        colonyMem['dpt_build']['request'] = [];
        this.initializeWorkerCreepsMem();
    }

}