import { sendLogisticTask } from "@/colony/dpt_comunication";
import { creepName, logisticTaskName } from "@/colony/nameManagement";
import { getContainerID } from "@/operationResearch/planningUtils";
import { CreepSpawning } from "@/structure/CreepSpawning";
import { Department } from "../Department";



export default class Dpt_Upgrader extends Department {

    constructor(dptRoom: string) {
        super(dptRoom, 'dpt_upgrade');
    }

    private sendTransferTaskContainer() {
        const request: TransferRequest = {
            'type': 'TRANSFER',
            'target': {
                'id': this.memory['storage']['id'],
                'resourceType': 'energy',
                'amount': 1
            }
        }
        sendLogisticTask(this.mainRoom, logisticTaskName(request), request);
    }

    private container_controllerRealiseTask() {
        const container = Game.getObjectById(this.memory['storage']['id'])
        if (!container) return
        const containerMem = Memory['colony'][this.mainRoom]['dpt_upgrade']['container'];   //@ts-ignore
        const stage = Math.trunc((2000 - container.store['energy']) / 500);
        //console.log(stage);
        
            //stage1:   < 1500 
            //stage2:   < 1000
            //stage3:   < 500
        if (stage >= 1 && Game.time >= containerMem['stage1']) {
            this.sendTransferTaskContainer();
            containerMem['stage1'] = Game.time + 50;
        }
        if (stage >= 2 && Game.time >= containerMem['stage2']) {
            this.sendTransferTaskContainer();
            containerMem['stage2'] = Game.time + 50;
        }
        if (stage >= 3 && Game.time >= containerMem['stage3']) {
            this.sendTransferTaskContainer();
            containerMem['stage3'] = Game.time + 50;
        }
        


    }



    private containerStage() {
        if (!this.memory['storage']['id']) return 
        this.container_controllerRealiseTask();
        const containerID = this.memory['storage']['id'];
 
        //calculate energy in container
        const containerID1 = getContainerID(this.mainRoom, 'container_source1');
        const containerID2 = getContainerID(this.mainRoom, 'container_source2');
        //@ts-ignore
        const container1 = Game.getObjectById(containerID1);    //@ts-ignore
        const container2 = Game.getObjectById(containerID2);    //@ts-ignore
        const energyInContainers = container1.store[RESOURCE_ENERGY] + container2.store[RESOURCE_ENERGY]
        
        if (energyInContainers > 3000) {    
            //create a transporter
            
            const numBuilders = Object.keys(this.memory['ticksToSpawn']).length;
            if (numBuilders <= 4) {
                if (numBuilders%2 == 0) {       //every 2 builders a transporter
                    const nameT = creepName();
                    const dataT: LogisticData = {
                        source: {
                            id: null,
                            roomName: this.mainRoom,
                            pos: null
                        }, 
                        target: null
                    };
                    CreepSpawning.sendToSpawnInitializacion(this.mainRoom, nameT,  'transporter', dataT, '-', false);
                }
                //create a upgrader
                const name =  creepName();
                    const data: Upgrader_baseData = {
                        'source': containerID,
                        'logisticCreepName': null
                    };
                CreepSpawning.sendToSpawnInitializacion(this.mainRoom, name, 'upgrader_base', data, 'dpt_upgrade', false);
                this.memory['ticksToSpawn'][name] = null;
            }
        }


    }

    private containerStage1() {
        if (!this.memory['storage']['id']) return 
        const containerID = this.memory['storage']['id'];

    }

    private clearMemory() {
        const savedUpgrader = this.memory['ticksToSpawn'];
        for (let creepName in savedUpgrader) {
            if (savedUpgrader[creepName] && savedUpgrader[creepName] < Game.time) {
                delete this.memory['ticksToSpawn'][creepName];
                delete Memory.creeps[creepName]
            }
        }
    }

    public run() {
        if (Game.rooms[this.mainRoom].controller.level <= 3) {
            const buildTask = Memory['colony'][this.mainRoom]['dpt_build']['buildTask'];
            if (!Object.keys(buildTask)[0]) {
                if(Game.time % 53 == 0) this.containerStage();
                if (Game.time % 53 == 0) this.container_controllerRealiseTask();
            }
        }

        if (Game.time % 23 == 0) {
            this.clearMemory();
        }

    }

}
