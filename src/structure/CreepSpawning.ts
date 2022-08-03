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
        /*
        const completeTask: SpawnTaskComplete = {
            creepName: name,
            deadTime: setting.ticksToSpawn(role, energyRCL) + 1500 + 10
        };
        */
       console.log(dpt);
       console.log(name);
       console.log(setting.ticksToSpawn(role, energyRCL));
       
       
       
        Memory['colony'][this.mainRoom][dpt]['ticksToSpawn'][name] = Game.time + setting.ticksToSpawn(role, energyRCL) + 1500 + 10;
        
    }

    public uid() {
        //return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
        return (Math.random().toString(36).substr(2,9));
    }

    private spawn(spawnName: string, creepName: string, creepRole: string, creepData:{}, dpt: string ): ScreepsReturnCode {
        const spawn = Game.spawns[spawnName];
        const energyRCL = setting.getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
        console.log(energyRCL);
        
        const creepBody = setting.getBody(creepRole, energyRCL);

        return spawn.spawnCreep(creepBody, creepName, {
            memory: {
                role: creepRole, 
                department: dpt,
                roomName: this.mainRoom,
                data: creepData
            }
        })
        
    }

    /**Creep Queen must be spawned or spawing */
    private renewQueen(): boolean {
        const queen = Game.creeps['Queen'+this.mainRoom];
        if (queen) {
            if (queen.spawning) return false;
            else if (queen.ticksToLive < 200) return true;
        }
    }

    private spawnQueen(): boolean {
        if (!Game.creeps['Queen'+this.mainRoom]) {
            
        }
        return true;
    }

    public run(): void {

        const spawnTask = this.memory['task']
        let spawnIndex = 0;

        for (let creepName in spawnTask) {  
            //console.log(creepName);
            
            const spawnList = this.memory['spawn'];
            if (spawnIndex < spawnList.length) {
            
              const spawnName:string = spawnList[spawnIndex];              
              const creepRole = spawnTask[creepName]['role'];
              const creepDpt = spawnTask[creepName]['department'];
              const creepData = spawnTask[creepName]['data'];
              if (this.spawn(spawnName, creepName, creepRole, creepData, creepDpt) == OK) {
                delete spawnTask[creepName];

                this.notifyTaskComplete(creepName, creepRole, creepDpt);
              }
              
              ++spawnIndex;
            }
        
        }
    }


}