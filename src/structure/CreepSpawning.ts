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
        const completeTaskList = this.memory['completeTask'];
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

        /** Funtion to control creep numbers, only used for OR */
        static sendToSpawnInitializacion(roomName: string, creepName: string, role: string,  task: {}, dpt: string, pull: boolean) {
            Memory['colony'][roomName]['creepSpawning']['task'][creepName] ={};
            
            const spawnTask = Memory['colony'][roomName]['creepSpawning']['task'][creepName];
            //console.log(creepName);
            
            spawnTask['role'] = role;
            spawnTask['roomName'] = roomName;
            spawnTask['department'] = dpt;
            spawnTask['task'] = task;
            spawnTask['dontPullMe'] = pull;
    
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

                this.notifyTaskComplete(creepName, creepRole, creepDpt);
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

    /**Creep Queen must be spawned or spawing */
    private renewQueen(): boolean {
        const queen = Game.creeps['Queen'+this.mainRoom];
        if (queen) {
            if (queen.spawning) return false;
            else if (queen.ticksToLive < 200) return true;
        }
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
    private initializeCreepState(creepName: string) {
        Memory.creeps[creepName]['ready'] = false;
        Memory.creeps[creepName]['working'] = false;
        Memory.creeps[creepName]['sendLogisticRequest'] = false;

    }

    private recycleSpawning(spawnName: string, creepName: string, creepRole: string): ScreepsReturnCode {
        const spawn = Game.spawns[spawnName];

        const energyRCL = setting.getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
        const creepBody = setting.getBody(creepRole, energyRCL);
        this.initializeCreepState(creepName);

        return spawn.spawnCreep(creepBody, creepName)
        
    }



    public run(): void {
        const queen = Game.creeps['Queen'+this.mainRoom];
        let r: ScreepsReturnCode;
        if (Memory.creeps['Queen'+this.mainRoom]) {
            if (!queen) {
                const spawnName = this.getAvailableSpawnName();
                if (spawnName) {
                    r = this.recycleSpawning(spawnName, 'Queen'+this.mainRoom, 'transporter')

                    
                }
            }
        } else {
            this.spawnQueen();
        }

        if (r != OK) this.spawnTaskExecution();

    }


}