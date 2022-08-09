import * as planningUtils from "./planningUtils";
import * as roomUtils from "../colony/roomUtils"
import * as names from "../colony/nameManagement"

export class OperationReserch {

    mainRoom: string;
    memory: {};

    constructor(mainRoom: string) {
        this.mainRoom = mainRoom;
        this.memory = Memory['colony'][mainRoom]['state'];
    }

    /*
    state {
        rcl: number
        fase: number

    }
    */

    

    /** Funtion to control creep numbers, only used for OR */
    private sendToSpawnInitializacion(creepName: string, role: string,  data: {}, dpt: string) {
        Memory['colony'][this.mainRoom]['creepSpawning']['task'][creepName] ={};
        
        const spawnTask = Memory['colony'][this.mainRoom]['creepSpawning']['task'][creepName];
        //console.log(creepName);
        
        spawnTask['role'] = role;
        spawnTask['roomName'] = this.mainRoom;
        spawnTask['department'] = dpt;
        spawnTask['data'] = data;

    }


    private buildSourceContainers() {
        console.log(111);
        
        const sourceContainer1Pos = planningUtils.getContainerPos(this.mainRoom, "container_source1");
        Game.rooms[this.mainRoom].createConstructionSite(sourceContainer1Pos[0], sourceContainer1Pos[1], 'container');
        const constructionSideID1 = planningUtils.getConstructionSideID(this.mainRoom, sourceContainer1Pos);
        let numCreepsNeeded1 = planningUtils.positionToHarvest(this.mainRoom, sourceContainer1Pos).length;

        if (numCreepsNeeded1 > 3) numCreepsNeeded1 = 3;
        const data1:HarvesterData = {
            source: planningUtils.getSourceEnery1ID(this.mainRoom),
            target: constructionSideID1
        }



        const sourceContainer2Pos = planningUtils.getContainerPos(this.mainRoom, "container_source2");
        Game.rooms[this.mainRoom].createConstructionSite(sourceContainer2Pos[0], sourceContainer2Pos[1], 'container');
        const constructionSideID2 = planningUtils.getConstructionSideID(this.mainRoom, sourceContainer2Pos);

        let numCreepsNeeded2 = planningUtils.positionToHarvest(this.mainRoom, sourceContainer2Pos).length;
        if (numCreepsNeeded2 > 3) numCreepsNeeded2 = 3;
        const data2:HarvesterData = {
            source: planningUtils.getSourceEnery2ID(this.mainRoom),
            target: constructionSideID2
        }

        const totalNum = numCreepsNeeded1 + numCreepsNeeded2;
        let par = true;
        for (let i = 0; i < totalNum; ++i) {
            const creepName = names.creepName();
            if (par) {
                this.sendToSpawnInitializacion(creepName, 'harvester',  data1, 'dpt_harvest')
                par = false;
            }
            else  {
                this.sendToSpawnInitializacion(creepName, 'harvester',  data2, 'dpt_harvest')
                par = true;
            }
            
        }

    }

    private buildUpgraderContainer() {

    }

    private leveUpAndBuildRoad() {

    }

    private buildColony() {
        const rcl:number = this.memory['buildColony']['buildRCL'];
        const fase:number = this.memory['buildColony']['fase'];
        switch(rcl) {
            case 0:        //new colony, only have a spawn
                if(fase == 0) this.buildSourceContainers();    
                else if (fase == 1) this.buildUpgraderContainer();  
                else this.leveUpAndBuildRoad();  
                                  
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

    private taskComplete():boolean {
        return false;
    }

    run() {
        
        if (this.memory['buildColony']['buildRCL'] != 9 && Game.time % 13 == 0) {
            if (!this.memory['buildColony']['working']){
                this.buildColony();
                this.memory['buildColony']['working'] = true;
            }
            
            else {                                //if OR are working, check if all task complete
                if (this.taskComplete()) {
                    this.memory['buildColony']['working'] = false;
                    const rcl:number = this.memory['buildColony']['buildRCL'];
                    this.memory['buildColony']['buildRCL'] = rcl + 1;
                    this.memory['buildColony']['fase'] = 0;
                }
            }
            
        }






    }


}