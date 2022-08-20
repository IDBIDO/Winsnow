import { creepName } from "@/colony/nameManagement";
import * as setting from "@/creep/setting"

export class CreepSpawning {
    mainRoom: string;       
    memory: {};

    constructor(mainRoom: string) {
        this.mainRoom = mainRoom;
        this.memory = Memory['colony'][mainRoom]['creepSpawning'];
    }

    /*
        colonyMem['Spawning'] = {};
        colonyMem['Spawning']['spawn'] = [];
        colonyMem['Spawning']['task'] = [];
        colonyMem['Spawning']['completeTask'] = {};
    */


    private notifyTaskComplete(name: string, role: string, dpt: string) {
        const energyRCL = setting.getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);

        Memory['colony'][this.mainRoom][dpt]['ticksToSpawn'][name] = Game.time + setting.ticksToSpawn(role, energyRCL) + 1500 + 10;
        
    }

    public uid() {
        //return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
        return (Math.random().toString(36).substr(2,9));
    }

    private spawn(spawnName: string, creepName: string, creepRole: string, creepData:{}, dpt: string, pull: boolean): ScreepsReturnCode {
        const spawn = Game.spawns[spawnName];
        const energyRCL = setting.getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
        //console.log(energyRCL);
        
        const creepBody = setting.getBody(creepRole, energyRCL);
        
        if (creepData) {
            return spawn.spawnCreep(creepBody, creepName, {
                memory: {
                    role: creepRole, 
                    department: dpt,
                    roomName: this.mainRoom,
                    task: creepData,
                    dontPullMe: pull
                }
            })
        } 
        else return spawn.spawnCreep(creepBody, creepName);
    }

    static sendToSpawnRecycle(roomName: string, creepName: string, role: string, dpt: string) {
        Memory['colony'][roomName]['creepSpawning']['task'][creepName] ={};
            
        const spawnTask = Memory['colony'][roomName]['creepSpawning']['task'][creepName];
            
        spawnTask['role'] = role;
        spawnTask['roomName'] = roomName;
        spawnTask['department'] = dpt;
    }

    /** send a creep spawning task. In case of recycle creep, param task must be null*/
    static sendToSpawnInitializacion(roomName: string, creepName: string, role: string,  task: {}, dpt: string, pull: boolean) {
        Memory['colony'][roomName]['creepSpawning']['task'][creepName] ={};
            
        const spawnTask = Memory['colony'][roomName]['creepSpawning']['task'][creepName];
            
        spawnTask['role'] = role;
        spawnTask['roomName'] = roomName;
        spawnTask['department'] = dpt;
        spawnTask['task'] = task;
        spawnTask['dontPullMe'] = pull;
    
    }

    private notifyOneTimeTRansporter(creepName:string, creepRole: string) {
        const energyRCL = setting.getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);

        Memory['colony'][this.mainRoom]['dpt_logistic']['oneTimeCreeps'][creepName] = Game.time + setting.ticksToSpawn(creepRole, energyRCL) + 1500 + 10;
        
    }

    private spawnTaskExecution() {
     
        const spawnTask = this.memory['task']
        let spawnIndex = 0;

        for (let creepName in spawnTask) {  
            //console.log(creepName);
            
            const spawnList = this.memory['spawn'];
            if (spawnIndex < spawnList.length) {
            
              const spawnName:string = spawnList[spawnIndex];              
              const creepRole = spawnTask[creepName]['role'];
              const creepDpt = spawnTask[creepName]['department'];
              const creepData = spawnTask[creepName]['task'];   //////////////////////
              const pull = spawnTask[creepName]['dontPullMe'];
              if (this.spawn(spawnName, creepName, creepRole, creepData, creepDpt, pull) == OK) {
                delete spawnTask[creepName];

                if (Memory['colony'][this.mainRoom][creepDpt]) this.notifyTaskComplete(creepName, creepRole, creepDpt);
                else if (creepRole == 'transporter') this.notifyOneTimeTRansporter(creepName, creepRole);
              }
              
              ++spawnIndex;
            }
        
        }
    }

    private getAvailableSpawnName():string {

        const spawnList = this.memory['spawn'];
        for (let i = 0;  i < spawnList.length; ++i) {
            if (Game.spawns[spawnList[i]].spawning == null) return spawnList[i];
        }
        return null;

    }


    private spawnQueen() {
        const spawnName = this.getAvailableSpawnName();
        
        if (spawnName) {
            //console.log(spawnName);

            const source: LogisticSourceTask = {
                id: null, 
                roomName: null,
                pos: null
            }
            const data: LogisticData = {
                source: source,
                target: null
            }
            let r = this.spawn(spawnName, 'Queen'+ this.mainRoom, 'iniQueen', data, 'dpt_logistic', false);
            console.log(r);
            
            
        }
    }
    static initializeCreepState(creepName: string) {
        Memory.creeps[creepName]['ready'] = false;
        Memory.creeps[creepName]['working'] = false;
        if (Memory.creeps[creepName]['sendLogisticRequest']) {
            Memory.creeps[creepName]['sendLogisticRequest'] = false;
        }
        //transporter
        if (Memory.creeps[creepName]['sendTaskRequest']) {
            Memory.creeps[creepName]['sendTaskRequest'] = false;
        }

    }

    private recycleQueenSpawning(spawnName: string, creepName: string, creepRole: string): ScreepsReturnCode {
        const spawn = Game.spawns[spawnName];

        const energyRCL = setting.getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
        const creepBody = setting.getBody(creepRole, energyRCL);
        CreepSpawning.initializeCreepState(creepName);
        
        const rcode =  spawn.spawnCreep(creepBody, creepName);
        if (rcode == OK) {
            CreepSpawning.initializeCreepState(creepName);
            Memory.creeps[creepName]['task']= {};
            Memory.creeps[creepName]['task']['type'] = null;
        }
        return rcode
        
    }



    public run(): void {
        const queen = Game.creeps['Queen'+this.mainRoom];
        let r: ScreepsReturnCode;
        if (Memory.creeps['Queen'+this.mainRoom]) {
            if (!queen) {
                const spawnName = this.getAvailableSpawnName();
                if (spawnName) {
                    r = this.recycleQueenSpawning(spawnName, 'Queen'+this.mainRoom, 'transporter')
                    console.log(r);
                    
                    
                }
            }
        } else {
            this.spawnQueen();
            
        }

        if (r != OK) this.spawnTaskExecution();

    }


}