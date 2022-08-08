import { Department } from "../Department";
import * as dpt_config from "@/department/dpt_config"
import { moveRequest, sendLogisticTask } from "@/colony/dpt_comunication";
import { taskName } from "@/colony/nameManagement";


export default class Dpt_Work extends Department {
    
    
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
        const rclEnergy = dpt_config.getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
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
            sendLogisticTask(creep.memory['roomName'], taskName(logisticTaskRequest), logisticTaskRequest);
        }
        //clear request
        this.memory['request'] = [];
    }
        

    public run() {
        /*
        if (Memory['colony'][this.mainRoom]['state']['updateCreepNum']) {
            this.actualizeCreepNumber();
            Memory['colony'][this.mainRoom]['state']['updateCreepNum']= false;
        }
        */
        this.processRequest();
    }


}