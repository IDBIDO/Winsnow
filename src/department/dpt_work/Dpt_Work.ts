import { Department } from "../Department";
import * as dpt_config from "@/department/dpt_config"
import * as setting from "@/creep/setting";

export default class Dpt_Work extends Department {
    
    
    constructor(dptRoom: string) {
        super(dptRoom, 'dpt_work');
    }
    

    private getNumActiveCreeps() {
        const creepsList = this.memory['creeps'];
        let cont = 0;
        for (let creepName in creepsList) {
            if (creepsList[creepName]['active']) ++cont;
        }
        return cont;
    }

    private activateCreeps(num: number): void {
        const creepsList = this.memory['creep'];
        
        
        for (let creepName in creepsList) {
          
            if (num && creepsList[creepName]['active'] == false) {
                this.sendSpawnTask(creepName, 'worker');
                --num;

            }
        }
    }

    actualizeCreepNumber(): void {
        const activeCreeps = this.getNumActiveCreeps();
        const rclEnergy = dpt_config.getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
        const numCreepsNeeded = dpt_config.permanentNumConfigs.dpt_work[rclEnergy];

        let dif = numCreepsNeeded - activeCreeps;
        
        if (dif > 0 ) {
            this.activateCreeps(dif);
        }
        else if (dif < 0) {

        }

        setting.workerSourceConfigUpdate(rclEnergy, this.mainRoom);

    }

    public recycleCreepsDead() {
        const ticksToSpawn = this.memory['ticksToSpawn'];
        for (let creepName in ticksToSpawn) {
            

            
            if (Game.time >= ticksToSpawn[creepName]) {
                this.sendSpawnTask(creepName, 'worker');
                delete ticksToSpawn[creepName];
                console.log(111111111111111111);
                
            }
        }
    }

    private realiaseBuildTask() {
        const rclEnergy = dpt_config.getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
        const memReference = Memory['colony'][this.mainRoom]['roomPlanning']['stage'];
        for (let structureName in memReference) {
            for (let i = 0; i < memReference[structureName].length; ++i) {
                this.memory['buildTask'].push({'name': structureName, 'position': memReference[structureName]})
                
                
                for (let j = 0; j < memReference[structureName].length; ++j) {
                    const pos = new RoomPosition(memReference[structureName][j][0], memReference[structureName][j][1], this.mainRoom);
                    console.log(pos);
                    
                    pos.createConstructionSite(structureName as BuildableStructureConstant);
                }
            }
        }
    }

    

    public run(): void {
        /*
        if (Memory['colony'][this.mainRoom]['state']['updateCreepNumWorker']) {
            //this.actualizeCreepNum();
            Memory['colony'][this.mainRoom]['state']['updateCreepNumWorker'] = false;
        }

        if (Memory['colony'][this.mainRoom]['state']['updateRoomPlanning']) {
            this.realiaseBuildTask();
            Memory['colony'][this.mainRoom]['state']['updateRoomPlanning'] = false;
        }
        this.creepExecution();

        if (Game.time%7) this.recycleCreepsDead();
*/

    }
}
