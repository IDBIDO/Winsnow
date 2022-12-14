import { Department } from "../Department";
import * as dpt_config from "@/department/dpt_config"
import * as setting from "@/creep/setting";
import * as names from "@/colony/nameManagement"
import { CreepSpawning } from "@/structure/CreepSpawning";
import { filter } from "lodash";
import { getEnergyRCL } from "@/creep/setting";

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
                
            }
        }
    }

    private realiaseBuildTask() {
        const rclEnergy = getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
        const memReference = Memory['colony'][this.mainRoom]['roomPlanning']['stage'];
        for (let structureName in memReference) {
            for (let i = 0; i < memReference[structureName].length; ++i) {
                this.memory['buildTask'].push({'name': structureName, 'position': memReference[structureName]})
                
                
                for (let j = 0; j < memReference[structureName].length; ++j) {
                    const pos = new RoomPosition(memReference[structureName][j][0], memReference[structureName][j][1], this.mainRoom);
                    
                    pos.createConstructionSite(structureName as BuildableStructureConstant);
                }
            }
        }
    }

    private getBuiilderWorkBody(energyRCL: number) {
        return setting.bodyComponentNum['builder'][energyRCL][0];
    }

    private getBuilderFactor(energyRCL: number) {
        return 1000/this.getBuiilderWorkBody(energyRCL);
    }

    private getBuildersNeeded(): number {
        const buildCost:number = this.memory['buildCost'];
        const availableEnergy = Game.rooms[this.mainRoom].energyCapacityAvailable;
        const energyRCL = getEnergyRCL(availableEnergy);
        
        const builderFactor = this.getBuilderFactor(energyRCL);

       
        const num = Math.trunc(buildCost/builderFactor) + 1;
        if (num > 5) return 5;
        else return num;
    

    }

    private getAliveCreeps(): number {
        const creepList = this.memory['ticksToSpawn'];
        let n = 0;
        for (let creepName in creepList) {
            if (Game.creeps[creepName] || creepList[creepName] == null) ++n;
        }
        return n;
    }

    static existTask(roomName: string): boolean {

        return (Memory['colony'][roomName]['dpt_build']['buildCost'] > 0)
    }
    
    static deleteBuildTask(roomName: string, id: string, pos: [number, number]) {

        //delete task and actualize creepCost
        const task: BuildTask = Memory['colony'][roomName]['dpt_build']['buildTask'][id];
        if (task) {
            //save structure id to planning model 
            const constuctionSidePos = new RoomPosition(pos[0], pos[1], roomName);
            const structure = constuctionSidePos.lookFor(LOOK_STRUCTURES);

            Memory['colony'][roomName]['roomPlanning']['model'][task.type][task.modelReference]['id'] = structure[0].id;

            const type:BuildableStructureConstant = Memory['colony'][roomName]['dpt_build']['buildTask'][id]['type'];
            const buildCost = Memory['colony'][roomName]['dpt_build']['buildCost'];
            Memory['colony'][roomName]['dpt_build']['buildCost'] = buildCost - CONSTRUCTION_COST[type];

            delete Memory['colony'][roomName]['dpt_build']['buildTask'][id];
            
        }
        //check if all task complete
        //console.log('Total build cost: ');
        //console.log(Memory['colony'][roomName]['dpt_build']['buildCost']);
        
        
        if (Memory['colony'][roomName]['dpt_build']['buildCost'] == 0) {
            Memory['colony'][roomName]['state']['buildColony']['task']['building'] = true;
        }

    }

    private creepsSavedDeath(): Array<string> {
        const creepList = this.memory['ticksToSpawn'];
        let creepsDeadName = [];
        for (let creepName in creepList) {
            if (creepList[creepName] && creepList[creepName] <= Game.time) creepsDeadName.push(creepName);
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
                //this.memory['transporterCreeps'][creepName] = '';
                CreepSpawning.sendToSpawnInitializacion(this.mainRoom, creepName,  'transporter', data, '-', false);
            }

            
            if (needToSpawn <= 0) return ;
            else {
                const buildersSaved = this.creepsSavedDeath();
                //spawn saved builders
                /*
                for (let i = 0; i < buildersSaved.length && needToSpawn; ++i) {
                    CreepSpawning.sendToSpawnRecycle(this.mainRoom, buildersSaved[i], 'builder', 'dpt_build')
                    //this.sendSpawnTask(buildersSaved[i], 'builder');
                    this.memory['ticksToSpawn'][buildersSaved[i]] = null;
                    CreepSpawning.initializeCreepState(buildersSaved[i]);
                    --needToSpawn;
                }
                */
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
                        logisticCreepName: null
                    }
                    CreepSpawning.sendToSpawnInitializacion(this.mainRoom, creepName, 'builder', data, 'dpt_build', false);
                    this.memory['ticksToSpawn'][creepName] = null;
                    --needToSpawn;
                }
            }
        }
    }


    private cleanCreepMemory() {
        const savedUpgrader = this.memory['ticksToSpawn'];
        for (let creepName in savedUpgrader) {
            if (savedUpgrader[creepName] && savedUpgrader[creepName] < Game.time) {
                delete this.memory['ticksToSpawn'][creepName];
                delete Memory.creeps[creepName]
            }
        }
    }

    public run(): void {

        if (Game.time%23 == 0) {
            this.checkCreepNum();
            
            //this.memory['actualize'] = false;
        }

        if (Game.time % 53 == 0)  {
            this.cleanCreepMemory();
        }


    }
}

