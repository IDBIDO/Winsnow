import * as planningUtils from "./planningUtils";
import * as roomUtils from "../colony/planningUtils"
import * as names from "../colony/nameManagement"
import { sendBuildTask } from "@/colony/dpt_comunication";
import { CreepSpawning } from "@/structure/CreepSpawning";
import Dpt_Harvest from "@/department/dpt_harvest/Dpt_Harvest";

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
        //Game.rooms[this.mainRoom].createConstructionSite(sourceContainer1Pos[0], sourceContainer1Pos[1], 'container');
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
        sendBuildTask(this.mainRoom, upgraderContainerList[0].id, upgraderContainerList[0].structureType,  [upgraderContainerList[0].pos.x, upgraderContainerList[0].pos.y]);


    }

    /** fase 3 */
    private level2AndBuildRoad() {

    }



    private buildColony() {
        const rcl:number = this.memory['buildColony']['buildRCL'];
        const fase:number = this.memory['buildColony']['fase'];
        switch(rcl) {
            case 0:        //new colony, only have a spawn
                if(fase == 0) this.putSourceUpgraderContainers();         
                else if (fase == 1) this.buildSourceContainers();         //building Task controlled by iniQueen
                else if (fase == 2) this.buildUpgraderContainer();        //buildingTask controlled by dpt_builder
                else this.level2AndBuildRoad();                           //levelUpTask controlled by Controller
                break;
                
            case 1:        
                
                break;
            case 2:
                break;
            case 3: 
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
                //fase 0 will jump automaty
                if (fase == 1) {
                    if (this.checkBuildTaskDone()) {
                        this.memory['buildColony']['fase'] = 2;     //construct controller container
                        this.resetFaseValues();
                    }
                }
                else if (fase == 2) {
                    
                }

            case 1:        

                break;
            case 2:
                break;
            case 3: 
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
        
        if (this.memory['buildColony']['buildRCL'] != 9 && Game.time % 13 == 0) {
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