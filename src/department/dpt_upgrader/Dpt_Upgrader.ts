import { creepName } from "@/colony/nameManagement";
import { getContainerID } from "@/operationResearch/planningUtils";
import { CreepSpawning } from "@/structure/CreepSpawning";
import { Department } from "../Department";



export default class Dpt_Upgrader extends Department {

    constructor(dptRoom: string) {
        super(dptRoom, 'dpt_upgrade');
    }

    private containerStage() {
        if (!this.memory['storage'][0]) return 
        const containerID = this.memory['storage'][0];
 
        //calculate energy in container
        const containerID1 = getContainerID(this.mainRoom, 'container_source1');
        const containerID2 = getContainerID(this.mainRoom, 'container_source2');
        //@ts-ignore
        const container1 = Game.getObjectById(containerID1);    //@ts-ignore
        const container2 = Game.getObjectById(containerID2);    //@ts-ignore
        const energyInContainers = container1.store[RESOURCE_ENERGY] + container2.store[RESOURCE_ENERGY]
        if (energyInContainers > 3000) {    
            //create a transporter
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
        
            //create a upgrader
            const name =  creepName();
                const data: Upgrader_baseData = {
                    'source': containerID,
                    'logisticCreepName': null
                };
            CreepSpawning.sendToSpawnInitializacion(this.mainRoom, name, 'upgrader_base', data, 'dpt_upgrade', false);
            this.memory['ticksToSpawn'][name] = null;

        }

    /*  
        const savedUpgrader = this.memory['ticksToSpawn'];
        const numUpgraderSaved = Object.keys(savedUpgrader);
        if (numUpgraderSaved.length < 5) {
            const numToSpawn = 5 - numUpgraderSaved.length;
            
            for (let i = 0; i < numToSpawn; ++i) {
                const name =  creepName();
                const data: Upgrader_baseData = {
                    'source': containerID,
                    'logisticCreepName': null
                };
                CreepSpawning.sendToSpawnInitializacion(this.mainRoom, name, 'upgrader_base', data, 'dpt_upgrade', false);
                this.memory['ticksToSpawn'][name] = null;
            }
        }
    */

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
        if (Game.time % 83 == 0 && Game.rooms[this.mainRoom].controller.level <= 3) {
            this.containerStage();
        }

        if (Game.time % 23 == 0) {
            this.clearMemory();
        }

    }

}
