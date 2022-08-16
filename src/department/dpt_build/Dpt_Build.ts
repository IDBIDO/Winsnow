import { Department } from "../Department";
import * as dpt_config from "@/department/dpt_config"
import * as setting from "@/creep/setting";
import * as names from "@/colony/nameManagement"
import { CreepSpawning } from "@/structure/CreepSpawning";

export default class Dpt_build extends Department {
    
    
    constructor(dptRoom: string) {
        super(dptRoom, 'dpt_build');
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
    /*
    actualizeCreepNumber(): void {
        const activeCreeps = this.getNumActiveCreeps();
        const rclEnergy = dpt_config.getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
        const numCreepsNeeded = dpt_config.permanentNumConfigs.dpt_build[rclEnergy];

        let dif = numCreepsNeeded - activeCreeps;
        
        if (dif > 0 ) {
            this.activateCreeps(dif);
        }
        else if (dif < 0) {

        }

        setting.workerSourceConfigUpdate(rclEnergy, this.mainRoom);

    }*/

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

    private getBuildersNeeded(): number {
        const buildCost:number = this.memory['buildCost'];
        const availableEnergy = Game.rooms[this.mainRoom].energyCapacityAvailable;
        const energyRCL = dpt_config.getEnergyRCL(availableEnergy);
        if (energyRCL <= 4) {
            const num = Math.trunc(buildCost/1000)
            if (num > 5) return 5;
            else return num;
        }
        else if (energyRCL == 5) {
            const num = Math.trunc(buildCost/2/1000)
            if (num > 5) return 5;
            else return num;
        }
        else if (energyRCL == 6) {
            const num = Math.trunc(buildCost/3/1000)
            if (num > 5) return 5;
            else return num;
        }
        else if (energyRCL == 7) {
            const num = Math.trunc(buildCost/5/1000)
            if (num > 5) return 5;
            else return num;
        }
        else {
            const num = Math.trunc(buildCost/7/1000)
            if (num > 5) return 5;
            else return num;
        }

    }

    private getAliveCreeps(): number {
        const creepList = this.memory['ticksToSpawn'];
        let n = 0;
        for (let creepName in creepList) {
            if (Game.creeps[creepName]) ++n;
        }
        return n;
    }
    
    private creepsSavedDeath(): Array<string> {
        const creepList = this.memory['ticksToSpawn'];
        let creepsDeadName = [];
        for (let creepName in creepList) {
            if (creepList[creepName] <= Game.time) creepsDeadName.push(creepName);
        }
        return creepsDeadName;

    }

    private checkCreepNum(): void {

        const buildTaskID = Object.keys(this.memory['buildTask']);
        if (buildTaskID.length <= 0) return;

        else {
            const buildersNeeded = this.getBuildersNeeded();
            const creepAlive = this.getAliveCreeps();

            let needToSpawn = buildersNeeded - creepAlive;
            if (needToSpawn <= 0) return ;
            else {
                const buildersSaved = this.creepsSavedDeath();
                for (let i = 0; i < buildersSaved.length && needToSpawn; ++i) {
                    this.sendSpawnTask(buildersSaved[i], 'builder');
                    --needToSpawn
                }
                while (needToSpawn) {
                    //create new builder unsaved
   
                        //create builder
                    const creepName = names.creepName();
                    const data: WorkerData = {
                        source: null,
                        target: {
                            id: null,
                            pos: null,
                            roomName: null
                        },
                    }
                    CreepSpawning.sendToSpawnInitializacion(this.mainRoom, creepName, 'builder', data, 'dpt_build', true);
                    //this.sendToSpawnInitializacion(creepName, 'builder', data, 'dpt_build');
                    --needToSpawn;
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
        if (Game.time%23 == 0) {
            this.checkCreepNum();
        }

    }
}
