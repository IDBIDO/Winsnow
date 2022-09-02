import { getRangePoints, isRampartProtectPos, translateNodeToPos, translatePosToNode } from "@/roomPlanning/planningUtils";
import { TranslatePlanning } from "@/roomPlanning/TranslatePlanning";
import { difference, intersection } from "@/utils";



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


    static constructionData(roomName: string, structureType: BuildableStructureConstant) {
        return Memory['colony'][roomName]['roomPlanning']['model'][structureType];
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
        this.initializeTowersMem();
        this.initializeDptRepair();
    }

    private compuLinkPosCanditate(candidateLinkPos: {}) {
        const colonyMem = Memory['colony'][this.mainRoom];
        const rampartList = colonyMem['roomPlanning']['temp']['rampart'];
        //let candidateLinkPos = {};
        for (let i = 0; i < rampartList.length; ++i) {
            const inRange2Pos = getRangePoints(rampartList[i], 2);
            for (let rangePos = 0; i < inRange2Pos.length; ++i) {
                if (isRampartProtectPos(this.mainRoom, inRange2Pos[rangePos])) {
                    //translate to pos to node
                    const node = translatePosToNode(inRange2Pos[rangePos]);
                    candidateLinkPos[node] = new Set();
                }
            }
        }
    }

    private compuRampartRangeLessEqual4(candidateLinkPos) {
        const colonyMem = Memory['colony'][this.mainRoom];
        const rampartList = colonyMem['roomPlanning']['temp']['rampart'];

        for (let nodeName in candidateLinkPos) {
            const nodePos = translateNodeToPos(parseInt(nodeName));
            const nodeRoomPos = new RoomPosition(nodePos[0], nodePos[1], this.mainRoom);
            for (let i = 0; i< rampartList.length; ++i) {
                if (nodeRoomPos.getRangeTo(rampartList[i][0], rampartList[i][1]) <= 4) {
                    candidateLinkPos[nodeName].add(i);
                }
            }
        }
    }

    private compuLinkDataAndDeleteCandidate(linkPosData: {}, candidateLinkPos:{}) {
        const colonyMem = Memory['colony'][this.mainRoom];
        const rampartList = colonyMem['roomPlanning']['temp']['rampart'];
        //const inRampartPos = colonyMem['roomPlanning']['inRampartPos'];
        const keys = Object.keys(candidateLinkPos);
        let maxNode = keys[0];
        //find max number rampart node
        for (let i in candidateLinkPos) {
            if (candidateLinkPos[i].size > candidateLinkPos[maxNode].size) {
                maxNode = i;
            }
        }

        //add maxNode to linkPosData
        linkPosData[maxNode] = candidateLinkPos[maxNode];

        //delete assigned rampart
        for (let i in candidateLinkPos) {
            candidateLinkPos[i] = difference(candidateLinkPos[i], linkPosData[maxNode]);
        }
    }

    private allRampartAssigned(candidateLinkPos: {}): boolean {
        let allAssigned = false;
        for (let i in candidateLinkPos) {
            if (candidateLinkPos[i].size) allAssigned = true;
        }
        return allAssigned;
    }

    private assignLinkToRampart() {

        const colonyMem = Memory['colony'][this.mainRoom];
        const rampartList = colonyMem['roomPlanning']['temp']['rampart'];

        const inRampartPos = colonyMem['roomPlanning']['inRampartPos'];
        
        let candidateLinkPos = {};
        //1. calcular candidatos a ser posicion de link
            /*  candirateLinkPos = {
                    node : {set of rampart reference}
                }
            */
        this.compuLinkPosCanditate(candidateLinkPos);
        const keys = Object.keys(candidateLinkPos);
        console.log('positions:');
        console.log(keys);
        
        /*

        // 2. calcular los rampart a posicion <= 4 a cada posicion candidato
        this.compuRampartRangeLessEqual4(candidateLinkPos);
        
        // 3. coger el nodo con mas rampart
        let linkNodeData ={};
        let allAssigned = false;
        while( !allAssigned ) {
            this.compuLinkDataAndDeleteCandidate(linkNodeData, candidateLinkPos);
            allAssigned = this.allRampartAssigned(candidateLinkPos);
        }
        */
    }

    private initializeDptRepair() {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['dpt_repair'] = {};
        colonyMem['dpt_repair']['actualHits'] = 0;
        colonyMem['dpt_repair']['task'] = {};
        colonyMem['dpt_repair']['rampartData'] = {};
        colonyMem['dpt_repair']['linksPos'] = [];
        colonyMem['dpt_repair']['ticksToSpawn'] = {};
        this.assignLinkToRampart();
    }

    private initializeTowersMem() {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['tower'] = {};
        colonyMem['tower']['data'] = {};
        colonyMem['tower']['healTask'] = {};
        colonyMem['tower']['attackTask'] = {};
        colonyMem['tower']['repairRoad'] = {};
        colonyMem['tower']['repairRampart'] = {};
    

    }


    private initializeCentralCluster() {
        
    }

    private initializeLabMem() {

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

        colonyMem['dpt_harvest']['container'] = {};

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