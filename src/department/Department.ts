import * as dpt_config from "@/department/dpt_config"

export abstract class Department {
    mainRoom: string;       
    type: string;       //department type, e.g. dpt_harvest
    memory: {};
    spawnTaskMemory: {};
    
    constructor(mainRoom:string, type: string) {
        this.mainRoom = mainRoom;
        this.type = type;
        this.memory = Memory['colony'][mainRoom][type];
        this.spawnTaskMemory = Memory['colony'][mainRoom]['creepSpawning'];
    }


    protected sendSpawnTask(creepName: string, roleType: string): void {
        const creepsList = this.memory['creep'];

        const spawnTask: SpawnTask = {
            creepName: creepName,
            role: roleType,
            dpt: 'dpt_work'
        }
        Memory['colony'][this.mainRoom]['creepSpawning']['task'][creepName] = {'role': roleType, 'dpt': 'dpt_work'}

            //Memory['colony'][this.mainRoom]['creepSpawning']['task'].push(spawnTask);
    
    }

    protected deleteCreep(creepName: string) {
        
    }

    protected abstract actualizeCreepNumber();

    protected sendToSpawnInitializacion(creepName: string, creepConfig: {}) {
        Memory['colony'][this.mainRoom]['creepSpawning']['task'][creepName] ={};
        
        const spawnTask = Memory['colony'][this.mainRoom]['creepSpawning']['task'][creepName];
        console.log(creepName);
        
        for (let config in creepConfig) {
            spawnTask[config] = creepConfig[config];
        }
    }

    protected uid() {
        //return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
        return (Math.random().toString(36).substr(2,9));
    }





    






}