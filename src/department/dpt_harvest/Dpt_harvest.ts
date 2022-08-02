import { Department } from "../Department";
import * as dpt_config from "@/department/dpt_config"
import * as setting from "@/creep/setting";
import { isNull, max, random } from "lodash";
import { maxTwoNumber } from "@/roomPlanning/planningUtils";

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
            const data:HarvesterData = {
                source: sourceId1.id,
                target: null
            }
            const role = 'harvester';
            for (let i = 0; i < numCreepsNeeded1; ++i) {
                const creepName = this.uid();
                
                this.sendToSpawnInitializacion(creepName, role,  data, 'dpt_harvest')
            }

            let numCreepsNeeded2 = dpt_config.positionToHarvest(this.mainRoom, sourceId2['pos']).length;
            if (numCreepsNeeded2 > 3) numCreepsNeeded2 = 3;
            const config2 = {
                source: sourceId2,
                target: null
            }
            for (let i = 0; i < numCreepsNeeded2; ++i) {
                const creepName = this.uid();
                
                //this.sendToSpawnInitializacion(creepName, config2)
            }


        }
        //let dif = numCreepsNeeded - activeCreeps;
        

        //setting.workerSourceConfigUpdate(rclEnergy, this.mainRoom);

    }


    public run() {
        if (Memory['colony'][this.mainRoom]['state']['updateCreepNum']) {
            this.actualizeCreepNumber();
            Memory['colony'][this.mainRoom]['state']['updateCreepNum']= false;
        }
        
        
       
    }


}