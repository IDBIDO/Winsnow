import * as dpt_config from "@/department/dpt_config"
import * as setting from "@/creep/setting";


export class CreepCreationDestruction {
    mainRoom: string;
    

    constructor(mainRoom: string) {
        this.mainRoom = mainRoom;
        
    }




    private anySpawnSpawning(): boolean {

        //list with all spawn's name in the room
        const spawnList = Memory['colony'][this.mainRoom]['creepSpawning']['spawn'];
        let spawning = false;
        for (let i = 0; i < spawnList.lenght; ++i) {
            const spawn = Game.spawns[spawnList[i]];
            if (spawn.spawning) spawning = true;
        }
        return spawning;
        
    }

    private cleanSapwnTask() {
        Memory['colony'][this.mainRoom]['creepSpawning']['task'] = {}
    
    }

    private deleteCreep(numNeeded: number, dptName: string, rclEnergy: number) {

    }

    private addCreeps(numNeeded: number, dptName: string, rclEnergy: number) {

        const creepDicc = Memory['colony'][this.mainRoom][dptName]['creep'];
        for (let i = 0; i < numNeeded; ++i) {
            let name = this.mainRoom + '_' + dptName + '_' + i;
            creepDicc[name] = {}
        }
        setting.updateCreepSetting( this.mainRoom, dptName, rclEnergy);

    }

    private actualizeCreepNumber(dptName: string) {
        const rclEnergy = dpt_config.getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
        //const role: string = dpt_config.permmanentCreepsRoleNum[this.mainRoom]['role'];
        const num: number = dpt_config.permmanentCreepsRoleNum[this.mainRoom]['numConfig'][rclEnergy];

        const creepDicc: {} = Memory['colony'][this.mainRoom][dptName]['creep'];
        const creepDiccLenght = Object.keys(creepDicc).length;
        let creepNeeded = num - creepDiccLenght;
        if (creepNeeded > 0) {
            this.addCreeps(creepNeeded,  dptName, rclEnergy);
        }
        else if (creepNeeded < 0) {
            this.deleteCreep(creepNeeded*-1,  dptName, rclEnergy);

        }
    }


    public run() {

        //colony needs actualize creep number and there are not creep spawning:
            /*  state:
                1. request stage: clean all spawn task
                2. preparation stage:  wait all spawning task finish
                3. update stage
            */
        let state = Memory['colony'][this.mainRoom]['state']['updateCreepNum'];
        if (state == 1) {
            this.cleanSapwnTask();
            Memory['colony'][this.mainRoom]['state']['updateCreepNum'] = 2;
        }
        else if (state == 2) {
            if (! this.anySpawnSpawning()) {
                Memory['colony'][this.mainRoom]['state']['updateCreepNum'] = 3;
            }
        }

        else if (state == 3) {

            this.actualizeCreepNumber('dpt_work');
            //this.actualizeCreepNumber('dpt_harvest');
            //this.actualizeCreepNumber('dpt_upgrader');
            //this.actualizeCreepNumber('dpt_logistic');
            Memory['colony'][this.mainRoom]['state']['updateCreepNum'] = 0;
        }
            
        
    }
}