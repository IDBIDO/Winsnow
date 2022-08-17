import { Department } from "../Department";
import * as dpt_config from "@/department/dpt_config"
import * as setting from "@/creep/setting";
import * as names from "@/colony/nameManagement"
import { CreepSpawning } from "@/structure/CreepSpawning";

export default class Dpt_Build extends Department {
    
    
    constructor(dptRoom: string) {
        super(dptRoom, 'dpt_build');
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

    private getBuildersNeeded(): number {
        const buildCost:number = this.memory['buildCost'];
        const availableEnergy = Game.rooms[this.mainRoom].energyCapacityAvailable;
        const energyRCL = dpt_config.getEnergyRCL(availableEnergy);
        
        if (energyRCL <= 4) {
            const num = Math.trunc(buildCost/1000) + 1;
            if (num > 5) return 5;
            else return num;
        }
        else if (energyRCL == 5) {
            const num = Math.trunc(buildCost/2/1000) + 1;
            if (num > 5) return 5;
            else return num;
        }
        else if (energyRCL == 6) {
            const num = Math.trunc(buildCost/3/1000) + 1;
            if (num > 5) return 5;
            else return num;
        }
        else if (energyRCL == 7) {
            const num = Math.trunc(buildCost/5/1000) + 1;
            if (num > 5) return 5;
            else return num;
        }
        else {
            const num = Math.trunc(buildCost/7/1000) + 1;
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


    
    static deleteBuildTask(roomName: string, id: string) {
        if (Memory['colony'][roomName]['dpt_build']['buildTask'][id]) {

            const type:BuildableStructureConstant = Memory['colony'][roomName]['dpt_build']['buildTask'][id]['type'];
            const buildCost = Memory['colony'][roomName]['dpt_build']['buildCost'];
            Memory['colony'][roomName]['dpt_build']['buildCost'] = buildCost - CONSTRUCTION_COST[type];

            delete Memory['colony'][roomName]['dpt_build']['buildTask'][id];
            
        }

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
            //spawn no saved transporter
            for (let i = 0; i < needToSpawn; ++i) {
                const creepName = names.creepName();
                const data: LogisticData = {
                    source: {
                        id: null,
                        roomName: this.mainRoom,
                        pos: null
                    }, 
                    target: null
                };
                CreepSpawning.sendToSpawnInitializacion(this.mainRoom, creepName,  'transporter', data, '-', false);
            }

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
                    const data: BuilderData = {
                        source: null,
                        target: {
                            id: null,
                            pos: null,
                            roomName: null
                        },
                    }
                    CreepSpawning.sendToSpawnInitializacion(this.mainRoom, creepName, 'builder', data, 'dpt_build', true);
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
        if (this.memory['actualize'] && Game.time%23 == 0) {
            this.checkCreepNum();
            this.memory['actualize'] = false;
        }

        if (Game.time % 13 == 0)  {
            //this.recycleCreepsDead();
        }

    }
}