import { Department } from "../Department";
import * as dpt_config from "@/department/dpt_config"
import { moveRequest, sendLogisticTask } from "@/colony/dpt_comunication";
import { logisticTaskName } from "@/colony/nameManagement";
import { getEnergyRCL, ticksToSpawn } from "@/creep/setting";
import { CreepSpawning } from "@/structure/CreepSpawning";


export default class Dpt_Harvest extends Department {
    
    
    constructor(dptRoom: string) {
        super(dptRoom, 'dpt_harvest');
    }

    private getSourceId1() {
        return Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'][0]
    }
    private getSourceId2() {
        return Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'][1]

    }
    actualizeCreepNumber(): void {
        const rclEnergy = getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
        if (rclEnergy == 1) {
            const sourceId1 = this.getSourceId1();
            const sourceId2 = this.getSourceId2();

            let numCreepsNeeded1 = dpt_config.positionToHarvest(this.mainRoom, sourceId1['pos']).length;
            if (numCreepsNeeded1 > 3) numCreepsNeeded1 = 3;
            const data1:HarvesterData = {
                source: sourceId1.id,
                target: null
            }

            const role = 'harvester';
            for (let i = 0; i < numCreepsNeeded1; ++i) {
                const creepName = this.uid();
                
                this.sendToSpawnInitializacion(creepName, role,  data1, 'dpt_harvest')
            }

            let numCreepsNeeded2 = dpt_config.positionToHarvest(this.mainRoom, sourceId2['pos']).length;
            if (numCreepsNeeded2 > 3) numCreepsNeeded2 = 3;
            const data2 = {
                source: sourceId2.id,
                target: null
            }
            for (let i = 0; i < numCreepsNeeded2; ++i) {
                const creepName = this.uid();
                
                this.sendToSpawnInitializacion(creepName, role, data2, 'dpt_harvest')
            }


        }
        //let dif = numCreepsNeeded - activeCreeps;
        

        //setting.workerSourceConfigUpdate(rclEnergy, this.mainRoom);

    }

    private processRequest() {
        const requestList = this.memory['request'];
        for (let i = 0; i < requestList.length; ++i) {
            const creepName = requestList[0];
            const creep = Game.creeps[creepName];
            const logisticTaskRequest: MoveRequest = moveRequest(creep.id, [creep.pos.x, creep.pos.y], creep.memory['roomName'])
            sendLogisticTask(creep.memory['roomName'], logisticTaskName(logisticTaskRequest), logisticTaskRequest);
        }
        //clear request
        this.memory['request'] = [];
    }

    static assigHarvesterToSource(roomName: string, source: "source1" | "source2", creepName: string) {
        if (source == "source1") {
            Memory['colony'][roomName]['dpt_harvest']['source1']['creeps'].push(creepName);
        }
        else {
            Memory['colony'][roomName]['dpt_harvest']['source2']['creeps'].push(creepName);
        }
    }

    private getHarvesterNeeded(): number {
        
        const availableEnergy = Game.rooms[this.mainRoom].energyCapacityAvailable;
        const energyRCL = getEnergyRCL(availableEnergy);
        //console.log(availableEnergy);
        
        //console.log(energyRCL);
        
        if (energyRCL == 1 ) return 3;
        else if (energyRCL == 2) {
            return 2;
        }
        else if (energyRCL == 3) {
            return 2;
        }
        else  {
            return 1;
        }


    }
        
    private checkCreepNum():void {
        const creepsSource1 = this.memory['source1']['creeps'];
        const creepsSource2 = this.memory['source2']['creeps'];
        if(Game.rooms[this.mainRoom].controller.level == 1) return;
        const harvesterNeeded = this.getHarvesterNeeded();
        //console.log(harvesterNeeded);
        
        let toDelete = creepsSource1.length - harvesterNeeded;
        while (toDelete) {
            const creepDeleted = creepsSource1[creepsSource1.length-1];
            delete this.memory['ticksToSpawn'][creepDeleted];
            creepsSource1.pop();
            --toDelete;
        }

        toDelete = creepsSource2.length - harvesterNeeded;
        while (toDelete) {
            const creepDeleted = creepsSource2[creepsSource1.length-1];
            delete this.memory['ticksToSpawn'][creepDeleted];
            creepsSource2.pop();
            --toDelete;
        }


    }

    private recycleCreep() {
        const creepList = this.memory['ticksToSpawn'];
        for (let creepName in creepList) {

            if (creepList[creepName] && creepList[creepName] <= Game.time) {
                CreepSpawning.sendToSpawnInitializacion(this.mainRoom, creepName, 'harvester',  null,'dpt_harvest', null);
                this.memory['ticksToSpawn'][creepName] = null;
            }
        }
    }

    static cleanContainerWithdrawPetition(roomName: string, containerId: string) {
        Memory['colony'][roomName]['dpt_harvest']['container'][containerId]['withdrawPetition'] = false;
    }

    private checkContainerEnergy() {
        const containerList = this.memory['container'];
        for (let id in containerList) {
           
            if (! containerList[id]['withdrawPetition']) {   //@ts-ignore
                const container = Game.getObjectById(id as Id<StructureContainer>);   
                const resourceList = Object.keys(container.store);
                
                let resourceIndex = 0;
                while (resourceIndex < resourceList.length && !containerList[id]['withdrawPetition']) {
                    if (container.store[resourceList[resourceIndex]] >= 900) {
                        const withdrawRequest: WithdrawRequest = {
                            'type': 'WITHDRAW',
                            'source': {
                                'id': id,     
                                'resourceType': resourceList[resourceIndex] as ResourceConstant,
                                'roomName': container.room.name,
                                'pos': [container.pos.x, container.pos.y]
                                
                            }
                        }
                        sendLogisticTask(this.mainRoom, logisticTaskName(withdrawRequest), withdrawRequest);
                        containerList[id]['withdrawPetition'] = true;
                    }
                    ++resourceIndex;
                }
                
            }
        }
    }

    public run() {
        if (Game.time % 151 == 0) {
            this.checkCreepNum();
        }
        if (Game.time % 13 == 0) {
            this.recycleCreep();
        }

        if (Game.time % 7 == 0) {
            this.checkContainerEnergy();
        }

    }


}