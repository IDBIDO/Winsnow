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
            dpt: 'dpt_build'
        }
        Memory['colony'][this.mainRoom]['creepSpawning']['task'][creepName] = {'role': roleType, 'dpt': 'dpt_build'}

            //Memory['colony'][this.mainRoom]['creepSpawning']['task'].push(spawnTask);
    
    }

    protected deleteCreep(creepName: string) {
        
    }

    //protected abstract actualizeCreepNumber();

    protected sendToSpawnInitializacion(creepName: string, role: string,  data: {}, dpt: string) {
        Memory['colony'][this.mainRoom]['creepSpawning']['task'][creepName] ={};
        
        const spawnTask = Memory['colony'][this.mainRoom]['creepSpawning']['task'][creepName];
        //console.log(creepName);
        
        spawnTask['role'] = role;
        spawnTask['roomName'] = this.mainRoom;
        spawnTask['department'] = dpt;
        spawnTask['data'] = data;
        

    }

    protected uid() {
        //return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
        return (Math.random().toString(36).substr(2,9));
    }





    






}