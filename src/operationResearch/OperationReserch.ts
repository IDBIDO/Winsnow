import * as planningUtils from "./planningUtils";
import * as roomUtils from "../colony/planningUtils"
import * as names from "../colony/nameManagement"
import { sendBuildTask } from "@/colony/dpt_comunication";
import { CreepSpawning } from "@/structure/CreepSpawning";
import Dpt_Harvest from "@/department/dpt_harvest/Dpt_Harvest";
import { distanceTwoPoints, nearPoint } from "@/roomPlanning/planningUtils";
import * as SuperMove from "../SuperMove"
import { Mem } from "@/colony/Memory";

/** CONTROL ALL DEPARTMENT */
export class OperationReserch {

    mainRoom: string;
    memory: {};

    constructor(mainRoom: string) {
        this.mainRoom = mainRoom;
        this.memory = Memory['colony'][mainRoom]['state'];
    }    

    /** Funtion to control creep numbers, only used for OR */
    private sendToSpawnInitializacion(creepName: string, role: string,  task: {}, dpt: string, pull: boolean) {
        Memory['colony'][this.mainRoom]['creepSpawning']['task'][creepName] ={};
        
        const spawnTask = Memory['colony'][this.mainRoom]['creepSpawning']['task'][creepName];
        //console.log(creepName);
        
        spawnTask['role'] = role;
        spawnTask['roomName'] = this.mainRoom;
        spawnTask['department'] = dpt;
        spawnTask['task'] = task;
        spawnTask['dontPullMe'] = pull;

    }

/************************** buildRCL 1 *********************************/
    /** fase 0 */
    private putSourceUpgraderContainers() {
        const sourceContainer1Pos = planningUtils.getContainerPos(this.mainRoom, "container_source1");
        Game.rooms[this.mainRoom].createConstructionSite(sourceContainer1Pos[0], sourceContainer1Pos[1], 'container');

        const sourceContainer2Pos = planningUtils.getContainerPos(this.mainRoom, "container_source2");
        Game.rooms[this.mainRoom].createConstructionSite(sourceContainer2Pos[0], sourceContainer2Pos[1], 'container');

        const controllerContainerPos = planningUtils.getContainerPos(this.mainRoom, 'container_controller');
        Game.rooms[this.mainRoom].createConstructionSite(controllerContainerPos[0], controllerContainerPos[1], 'container');

        this.memory['buildColony']['fase'] = 1;
        this.memory['buildColony']['working'] = false;
        
    }

    /** fase 1 */
    private buildSourceContainers() {

        const sourceContainer1Pos = planningUtils.getContainerPos(this.mainRoom, "container_source1");
        const constructionSideID1 = planningUtils.getConstructionSideID(this.mainRoom, sourceContainer1Pos);
        let numCreepsNeeded1 = planningUtils.positionToHarvest(this.mainRoom, planningUtils.getSourceEnery1Pos(this.mainRoom)).length;

        if (numCreepsNeeded1 > 3) numCreepsNeeded1 = 3;
        const data1:InitializerData = {
            source: planningUtils.getSourceEnery1ID(this.mainRoom),
            target: {
                id: constructionSideID1,
                pos: [sourceContainer1Pos[0], sourceContainer1Pos[1]]
            }
        }

        const sourceContainer2Pos = planningUtils.getContainerPos(this.mainRoom, "container_source2");
        //Game.rooms[this.mainRoom].createConstructionSite(sourceContainer2Pos[0], sourceContainer2Pos[1], 'container');
        const constructionSideID2 = planningUtils.getConstructionSideID(this.mainRoom, sourceContainer2Pos);

        let numCreepsNeeded2 = planningUtils.positionToHarvest(this.mainRoom, planningUtils.getSourceEnery2Pos(this.mainRoom)).length;
        if (numCreepsNeeded2 > 3) numCreepsNeeded2 = 3;
        const data2:InitializerData = {
            source: planningUtils.getSourceEnery2ID(this.mainRoom),
            target: {
                id: constructionSideID2,
                pos: [sourceContainer2Pos[0], sourceContainer2Pos[1]]
            }
        }

        //send spawn task
        const totalNum = numCreepsNeeded1 + numCreepsNeeded2;
        let par = true;
        for (let i = 0; i < totalNum; ++i) {
            const creepName = names.creepName();
            if (par) {
                //this.sendToSpawnInitializacion(creepName, 'initializer',  data1, 'dpt_harvest')
                CreepSpawning.sendToSpawnInitializacion(this.mainRoom, creepName, 'initializer',  data1, 'dpt_harvest', true);
                Dpt_Harvest.assigHarvesterToSource(this.mainRoom, "source1", creepName);
                par = false;

                //save creep name to check task completation
                this.memory['buildColony']['task']['building'] = false;     

            }
            else  {
                CreepSpawning.sendToSpawnInitializacion(this.mainRoom, creepName, 'initializer',  data2, 'dpt_harvest', true);
                Dpt_Harvest.assigHarvesterToSource(this.mainRoom, "source2", creepName);

                //this.sendToSpawnInitializacion(creepName, 'initializer',  data2, 'dpt_harvest');
                par = true;
            }
            
        }

    }
    private setCreepActualization() {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['dpt_build']['actualize'] = true;

    }

    private posInControllerRange(targetPos: RoomPosition) {
        const controllerPos = Game.rooms[this.mainRoom].controller.pos;
        if (targetPos.getRangeTo(controllerPos) <= 4) return true;
        return false;
    }

    /** fase 2 */
    private buildUpgraderContainer() {
        console.log('FASE 2: BUILD UPGRADER CONTAINER');
        
        this.setCreepActualization();
        /*
        //5 transporter and 3 builders (including the queen)
        for (let i = 0; i < 6; ++i) {
            if ( i == 0  || i == 2 || i == 5)  {
                //create builder
                const creepName = names.creepName();
                const data: BuilderData = {
                    source: null,
                    target: {
                        id: null,
                        pos: null,
                        roomName: null
                    },
   
                }
                CreepSpawning.sendToSpawnInitializacion(this.mainRoom, creepName, 'builder', data, 'dpt_build', false);

                //this.sendToSpawnInitializacion(creepName, 'builder', data, 'dpt_build');
            }
            else {
                const creepName = names.creepName();
                const data: LogisticData = {
                    source: {
                        id: null,
                        roomName: this.mainRoom,
                        pos: null
                    }, 
                    target: null
                };
                CreepSpawning.sendToSpawnInitializacion(this.mainRoom, creepName,  'transporter', data, 'dpt_logistic', false);

                //this.sendToSpawnInitializacion(creepName, 'transporter', data, 'dpt_logistic');
            }
        }
        */
        
        //set logistic storage storage
        /*
        const sourceContainer1ID = planningUtils.getContainerID(this.mainRoom, 'container_source1');
        const sourceContainer2ID = planningUtils.getContainerID(this.mainRoom, 'container_source2');
        Memory['colony'][this.mainRoom]['dpt_logistic']['storage'].push(sourceContainer1ID);
        Memory['colony'][this.mainRoom]['dpt_logistic']['storage'].push(sourceContainer2ID);
        */
        //send upgraderContainer build task to dpt_builder
        const upgraderContainerList = Game.rooms[this.mainRoom].find(FIND_CONSTRUCTION_SITES);

        //sendBuildTask(this.mainRoom, upgraderContainerList[0].id, upgraderContainerList[0].structureType,  [upgraderContainerList[0].pos.x, upgraderContainerList[0].pos.y]);
        const buildData: BuildTask = {
            'type': upgraderContainerList[0].structureType,
            'roomName': this.mainRoom,
            'pos': [upgraderContainerList[0].pos.x, upgraderContainerList[0].pos.y],
            'modelReference': planningUtils.getContainerReference(this.mainRoom, 'container_controller')
        }
        sendBuildTask(upgraderContainerList[0].id, buildData);
    }

    private buildReference(structureType: string, ref: number) {
        const refData = Memory['colony'][this.mainRoom]['roomPlanning']['model'][structureType][ref];
        const refPos = new RoomPosition(refData['pos'][0], refData['pos'][1], this.mainRoom); //@ts-ignore
        const rcode = refPos.createConstructionSite( structureType);

        //save reference and position
        if (rcode == OK) {
            const constructionSideRefPos = Memory['colony'][this.mainRoom]['roomPlanning']['constructionSide'];
            constructionSideRefPos[structureType][ref] = [refPos.x, refPos.y]
        }

    }

    /** fase 3 */
    private createSpawnToSourceRoad() {
        //save controller container to dpt_upgrader
        console.log('FASE 3: CREATE ROADS');
        
        const controllerContainer = planningUtils.getContainerID(this.mainRoom, 'container_controller');
        Memory['colony'][this.mainRoom]['dpt_upgrade']['storage']['id'] = controllerContainer;


        const spawn0ToSource1RoadRef = Memory['colony'][this.mainRoom]['roomPlanning']['roadReference']['spawn0ToSource1']
        for (let i = 0; i < spawn0ToSource1RoadRef.length; ++i) {
            this.buildReference('road', spawn0ToSource1RoadRef[i])
        }
        const spawn0ToSource2RoadRef = Memory['colony'][this.mainRoom]['roomPlanning']['roadReference']['spawn0ToSource2']
        for (let i = 0; i < spawn0ToSource2RoadRef.length; ++i) {
            this.buildReference('road', spawn0ToSource2RoadRef[i])
        }
        const spawn0ToController = Memory['colony'][this.mainRoom]['roomPlanning']['roadReference']['spawn0ToController']
        for (let i = 0; i < spawn0ToController.length; ++i) {
            this.buildReference('road', spawn0ToController[i])
        }
        this.memory['buildColony']['fase'] = 4;
        this.memory['buildColony']['working'] = false;

    }
    /** fase 4 */
    private sendConstructionSideToBuildTask(structureType: BuildableStructureConstant) {
        /*
            {
                'road'{
                    9: [x, y],
                    8: [x, y]
                },
                'extension' {
                    
                }
            }
        */
        console.log('CREATE ' + structureType +' BUILD TASKS');

        const constructionSideRefPos = Memory['colony'][this.mainRoom]['roomPlanning']['constructionSide'];
        for (let ref in constructionSideRefPos[structureType]) {
            const pos: [number, number] = constructionSideRefPos[structureType][ref];
            const csPos = new RoomPosition(pos[0], pos[1], this.mainRoom);
            const constructionSide = csPos.lookFor(LOOK_CONSTRUCTION_SITES);
            for (let i = 0; i< constructionSide.length; ++i) {
                if (constructionSide[i].structureType == structureType) {
                    const buildData: BuildTask = {
                        'type': constructionSide[i].structureType,
                        'roomName': this.mainRoom,
                        'pos': [constructionSide[i].pos.x, constructionSide[i].pos.y],
                        'modelReference': parseInt(ref)
                    }
                    sendBuildTask(constructionSide[i].id, buildData);
                    delete Memory['colony'][this.mainRoom]['roomPlanning']['constructionSide'][structureType][ref];

                    if (structureType == 'road') {
                        delete  Memory['colony'][this.mainRoom]['roomPlanning']['temp']['road'][ref];
                    }
                    else if (structureType == 'extension') {
                        delete Memory['colony'][this.mainRoom]['roomPlanning']['temp']['extension'][ref];
                    }
                }
            }
        }

        /*
        const contructionSideList =  Game.rooms[this.mainRoom].find(FIND_CONSTRUCTION_SITES);
        for (let i = 0; i < contructionSideList.length; ++i) {
            const buildData: BuildTask = {
                'type': contructionSideList[i].structureType,
                'roomName': this.mainRoom,
                'pos': [contructionSideList[i].pos.x, contructionSideList[i].pos.y],
                'modelReference': ref
            }
        }
        sendBuildTask(contructionSideList[0].id, buildData);
    
        if (structureType == 'road') {
            delete Memory['colony'][this.mainRoom]['roomPlanning']['temp']['road'][ref];
        }
        else if (structureType == 'extension') {
            delete Memory['colony'][this.mainRoom]['roomPlanning']['temp']['extension'][ref];
        }
        */
    }

    private sendBuildTaskRCL0fase4() {
        this.sendConstructionSideToBuildTask('road');
    }

    public constructAdjacentRoad(pos: [number, number]) {
        const roadList = Memory['colony'][this.mainRoom]['roomPlanning']['temp']['road'];
        
        for (let ref in roadList) {
            
            if (distanceTwoPoints(roadList[ref], pos) == 1) {
                this.buildReference('road', parseInt(ref))
            }
        }
    }

    private createBuildingsAndAdjacentsRoads(structureType: BuildableStructureConstant) {
        const rcl = Game.rooms[this.mainRoom].controller.level;
        const actualExtensionAvailable = CONTROLLER_STRUCTURES[structureType][rcl];
        const previousExtensionAvailable = CONTROLLER_STRUCTURES[structureType][rcl-1];

        let extensionBuildable = actualExtensionAvailable - previousExtensionAvailable;
        const tempExt = Memory['colony'][this.mainRoom]['roomPlanning']['temp'][structureType];
        for (let extRef in tempExt) {
            const pos = new RoomPosition(tempExt[extRef][0], tempExt[extRef][1], this.mainRoom);
            if (Game.rooms[this.mainRoom].controller.level == 8 || !this.posInControllerRange(pos)) {
                const rcode = pos.createConstructionSite(structureType);
                if (rcode == OK) {
                    //const constructionSideRefPos = Memory['colony'][this.mainRoom]['roomPlanning']['constructionSide'];
                    Memory['colony'][this.mainRoom]['roomPlanning']['constructionSide'][structureType][extRef] = [pos.x, pos.y]
                    this.constructAdjacentRoad([pos.x, pos.y]);
                    --extensionBuildable;
                }
                if (!extensionBuildable) break;
            }
        }

    }

    private checkNewTower() {
        const towerList = Memory['colony'][this.mainRoom]['roomPlanning']['model']['tower'];
        const actualTower = Memory['colony'][this.mainRoom]['tower']['data'];
        for (let i = 0; i < towerList.length; ++i) {
            const towerId = towerList[i]['id'];
            if (towerId) {
                
                if (!actualTower[towerId]) {
                    const towerData: towerData = {
                        'energyPetition': false,
                        'task': null,
                        'pos': towerList['pos']
                    }
                    Memory['colony'][this.mainRoom]['tower']['data'][towerId] = towerData;

                }
            }
        }
    }

    private createOneStructure(structureType: BuildableStructureConstant, ref: number, pos: [number, number]): ScreepsReturnCode {
        const ObjectPos = new RoomPosition(pos[0], pos[1], this.mainRoom);
        const rcode = ObjectPos.createConstructionSite(structureType);
        if (rcode == OK) {
            //const constructionSideRefPos = Memory['colony'][this.mainRoom]['roomPlanning']['constructionSide'];
            Memory['colony'][this.mainRoom]['roomPlanning']['constructionSide'][structureType][ref] = [ObjectPos.x, ObjectPos.y]
            this.constructAdjacentRoad([ObjectPos.x, ObjectPos.y]);
        }

        return rcode

    }

    private buildColony() {
        const rcl:number = this.memory['buildColony']['buildRCL'];
        const fase:number = this.memory['buildColony']['fase'];
        switch(rcl) {
            case 0:        //new colony, only have a spawn
                if(fase == 0) this.putSourceUpgraderContainers();         
                else if (fase == 1) this.buildSourceContainers();         //building Task controlled by iniQueen
                else if (fase == 2) this.buildUpgraderContainer();        //buildingTask controlled by dpt_builder
                else if (fase == 3) this.createSpawnToSourceRoad();                           //levelUpTask controlled by Controller
                else this.sendBuildTaskRCL0fase4();
    
                break;
                
            case 1:        
                if (fase == 0) { 
                    SuperMove.options.deletePathInRoom(this.mainRoom)
                    this.createBuildingsAndAdjacentsRoads('extension');
                    this.memory['buildColony']['fase'] = 1;
                    this.memory['buildColony']['working'] = false;
                }
                else if (fase == 1) {
                    this.sendConstructionSideToBuildTask('extension');
                    this.sendConstructionSideToBuildTask('road');
                }
                break;
            case 2:
                if (fase == 0) {
                    SuperMove.options.deletePathInRoom(this.mainRoom)
                    this.createBuildingsAndAdjacentsRoads('extension');
                    this.createBuildingsAndAdjacentsRoads('tower');

                    this.memory['buildColony']['fase'] = 1;
                    this.memory['buildColony']['working'] = false;
                }
                else if (fase == 1) {
                    this.sendConstructionSideToBuildTask('extension');
                    this.sendConstructionSideToBuildTask('road');
                    this.sendConstructionSideToBuildTask('tower');

                    this.memory['buildColony']['fase'] = 2;
                    this.memory['buildColony']['working'] = false;
                }
                else if (fase == 2) {
                    this.checkNewTower();
                    
                    
                }
            
                break;

            case 3: 
                //create storage construction side
                if (fase == 0) {        
                    SuperMove.options.deletePathInRoom(this.mainRoom)
                    this.createBuildingsAndAdjacentsRoads('storage');

                    this.memory['buildColony']['fase'] = 1;
                    this.memory['buildColony']['working'] = false;
                }
                //realise storage contruction task
                else if (fase == 1) {   
                    this.sendConstructionSideToBuildTask('storage');
                    this.sendConstructionSideToBuildTask('road');
                    
                }
                //change logistic mecanism to storage
                //add source container to Dpt_harvest, and active withdraw tasks

                else if (fase == 2) {   
                    console.log('MOVE 100K ENERGY TO STORAGE');
                    
                    
                    const logisticStorage = Memory['colony'][this.mainRoom]['dpt_logistic']['storage'];
                    for (let i = 0; i < logisticStorage.length; ++i) {
                        Memory['colony'][this.mainRoom]['dpt_harvest']['container'][logisticStorage[i]] = {
                            withdrawPetition: false,
                        }
                        
                    }


                }
                //delete source container from Dpt_Logistic
                //add storage to Dpt_Losgistic
                else if (fase == 3) {
                    console.log('CHANGE STORAGE MECANISM');
                    Memory['colony'][this.mainRoom]['dpt_logistic']['storage'] = [];

                    Memory['colony'][this.mainRoom]['dpt_logistic']['storage'].push(Game.rooms[this.mainRoom].storage.id)
                    this.memory['buildColony']['fase'] = 4;
                    this.memory['buildColony']['working'] = false;
                }

                //build extensions
                else if (fase == 4) {
                    this.createBuildingsAndAdjacentsRoads('extension');

                    this.memory['buildColony']['fase'] = 5;
                    this.memory['buildColony']['working'] = false;
                }
                else if (fase == 5) {
                    this.sendConstructionSideToBuildTask('extension');
                    this.sendConstructionSideToBuildTask('road');
                }

                /*
                Fase 5:
                check if all rampart constructionSide are created
                if not, create a new one and jump to Fase 6.
                if complete jump to fase 7
                */
                else if (fase == 6) {
                    const rampartList = Mem.constructionData(this.mainRoom, 'rampart');
                    let newRampart = false;
                    for (let ref = 0; ref < rampartList.length; ++ref) {
                        if (!rampartList[ref]['id']) {
                            const rcode = this.createOneStructure('rampart', ref, rampartList[ref]['pos']);
                            if (rcode == OK) {
                                newRampart = true;
                                break;
                            } 
                        }
                    }
                    if (newRampart) {
                        this.memory['buildColony']['fase'] = 7;
                        this.memory['buildColony']['working'] = false;
                    }
                    else {
                        this.memory['buildColony']['fase'] = 8;
                        this.memory['buildColony']['working'] = false;
                    }
                }

                /*
                Fase 6: 
                send build task, if complete jump to fase 5
                */
                else if (fase == 7) {
                    this.sendConstructionSideToBuildTask('rampart');

                }

                else if (fase == 8) {

                }

                break;

            case 4:
                break;
            case 5:
                break;

            case 6: 
                break;
            case 7:

                break;

            default:
                break;
        }
    }

    /*
    private sourceContainersBuild(): boolean {
        const container_source1 = planningUtils.getContainerID(this.mainRoom, 'container_source1');
        const container_source2 = planningUtils.getContainerID(this.mainRoom, 'container_source2');
        if (container_source1 != null && container_source2 != null) return true;

    }
*/
    private checkBuildTaskDone(): boolean {
        return this.memory['buildColony']['task']['building'];
    }

    private checkLevelUpTaskDone(): boolean {
        return this.memory['buildColony']['task']['levelUP'];
    }

    private resetFaseValues() {
        this.memory['buildColony']['working'] = false;      //tell OR to run next fase
        this.memory['buildColony']['task']['building'] = false;
        this.memory['buildColony']['task']['levelUP'] = false;

        
    }


    private faseComplete():boolean {
        const rcl:number = this.memory['buildColony']['buildRCL'];
        const fase:number = this.memory['buildColony']['fase'];
        switch(rcl) {
            case 0:        
                //fase 0 will jump automaty to fase 1
                //----------------------

                //fase 1 complete if controller container builded
                if (fase == 1) {
                    if (this.checkBuildTaskDone()) {
                        this.memory['buildColony']['fase'] = 2;     //construct controller container
                        this.resetFaseValues();
                    }
                }
                //fase 2 complete if controller container build 
                else if (fase == 2) {
                    if (this.checkBuildTaskDone()) {
                        this.memory['buildColony']['fase'] = 3;
                        this.resetFaseValues();
                    }
                }
                //fase 3 will jamp atomaty to fase 4
                //--------------

                //fase 4 complete if road build and rcl level 2
                else if (fase == 4) {
                    if (this.checkBuildTaskDone() && this.checkLevelUpTaskDone()) {
                        this.memory['buildColony']['buildRCL'] = 1;
                        this.memory['buildColony']['fase'] = 0;
                        this.resetFaseValues();
                    }
                }
            case 1:        
                if (fase == 1) {
                    if (this.checkBuildTaskDone() && this.checkLevelUpTaskDone()) {
                        this.memory['buildColony']['buildRCL'] = 2;
                        this.memory['buildColony']['fase'] = 0;
                        this.resetFaseValues();
                    }
                }
                break;
            case 2:
                if (fase == 1) {
                    if (this.checkBuildTaskDone()) {
                        this.memory['buildColony']['fase'] = 2;
                        this.resetFaseValues();
                    }
                }
                else if (fase == 2) {
                    if (this.checkBuildTaskDone() && this.checkLevelUpTaskDone()) {
                        this.memory['buildColony']['buildRCL'] = 3;
                        this.memory['buildColony']['fase'] = 0;
                        this.resetFaseValues();
                    }
                }

                break;

            case 3: 

                //fase 0 jump auto
            
                if (fase == 1) {
                    if (this.checkBuildTaskDone()) {
                        this.memory['buildColony']['fase'] = 2;
                        this.resetFaseValues();
                    }
                } 

                //wait to storage get 100k energy
                else if (fase == 2) {
                    const storage = Game.rooms[this.mainRoom].storage;
                    if (storage.store['energy'] > 100000) {
                        this.memory['buildColony']['fase'] = 3;
                        this.resetFaseValues();
                    }
                }

                //fase 3 jump auto

                //fase 4 jump auto

                //wait build extension
                else if (fase == 5) {
                    if (this.checkBuildTaskDone()) {
                        this.memory['buildColony']['fase'] = 5;
                        this.resetFaseValues();
                    }
                }

                //fase 6 jump auto

                else if (fase == 7) {
                    //check if no constructionSide and all rampart hits > 10k
                    
                }
            
                break;
            case 4:
                break;
            case 5:
                break;

            case 6: 
                break;
            case 7:

                break;

            default:
                break;
        }
        return false;
    }

    run() {
        
        if (this.memory['buildColony']['buildRCL'] != 8 && Game.time % 7 == 0) {
            if (!this.memory['buildColony']['working']){
                this.memory['buildColony']['working'] = true;
                this.buildColony();
                
            }
            
            
            else {                                //if OR are working, check if all task complete
                this.faseComplete();
            }
            
            
        }






    }


}