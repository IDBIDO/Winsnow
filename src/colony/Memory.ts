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
        
        colonyMem['state']['controller'] = {};
        colonyMem['state']['controller']['fillTaskTTL'] = -1;
        colonyMem['state']['controller']['actualRCL'] = 1;


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
        this.initializeDptUpgrader();
        

    }

    private initializeDptUpgrader() {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['dpt_upgrade'] = {};
        colonyMem['dpt_upgrade']['actualize'] = false;
        colonyMem['dpt_upgrade']['storage'] = {};
        colonyMem['dpt_upgrade']['storage']['id'] = null;
        colonyMem['dpt_upgrade']['container'] = {};
        colonyMem['dpt_upgrade']['container']['stage1'] = 0;
        colonyMem['dpt_upgrade']['container']['stage2'] = 0;
        colonyMem['dpt_upgrade']['container']['stage3'] = 0;


        colonyMem['dpt_upgrade']['ticksToSpawn'] = {};

    }
    
    private initializeDptLogistic() {
        const colonyMem = Memory['colony'][this.mainRoom];
        
        colonyMem['dpt_logistic'] = {};

        colonyMem['dpt_logistic']['actualize'] = false;

        colonyMem['dpt_logistic']['storage'] = [];

        colonyMem['dpt_logistic']['fillTask'] = false;

        colonyMem['dpt_logistic']['request'] = [];
        
        colonyMem['dpt_logistic']['sourceTask'] = {};
        colonyMem['dpt_logistic']['targetTask'] = {};

        colonyMem['dpt_logistic']['oneTimeCreeps'] = {};
        colonyMem['dpt_logistic']['ticksToSpawn'] = {};

    }

    private initializeDptHarvest() {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['dpt_harvest'] = {};

        colonyMem['dpt_harvest']['actualize'] = false;

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
        colonyMem['dpt_build']['actualize'] = false;
        colonyMem['dpt_build']['ticksToSpawn'] = {};
        colonyMem['dpt_build']['buildCost'] = 0;
        colonyMem['dpt_build']['buildTask'] = {};
        colonyMem['dpt_build']['request'] = [];
        colonyMem['dpt_build']['transporterCreeps'] = {}
    }

}