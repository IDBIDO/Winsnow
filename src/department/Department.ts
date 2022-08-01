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

    protected actualizeCreepNumber() {
        const rclEnergy = dpt_config.getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
        const role: string = dpt_config.permmanentCreepsRoleNum[this.mainRoom]['role'];
        const num: number = dpt_config.permmanentCreepsRoleNum[this.mainRoom]['numConfig'][rclEnergy];

        this.memory['creep'] = {};

        //get old creeps name
        let oldCreepList = Array<string>();
        for (let creepName in this.memory['creep']) {
            oldCreepList.push(creepName);
        }
        
        //get new creeps name and save them to memory
        let newCreepList = Array<string>(num);
        for (let i = 0; i < num; ++i) {
            const creepName = this.mainRoom + '_' + this.type + i;
            newCreepList[i] = creepName;
            this.memory['creep'][creepName] = {};
        }

        if (oldCreepList > newCreepList) {
            for (let i = 0; i < oldCreepList.length; ++i) {
                if (! newCreepList.includes(oldCreepList[i])) {
                    this.deleteCreep(oldCreepList[i])
                }
            }
        }


        
    }


    





    






}