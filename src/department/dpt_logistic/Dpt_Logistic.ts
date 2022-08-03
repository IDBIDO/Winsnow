import { Department } from "../Department";
import * as dpt_config from "@/department/dpt_config"


export default class Dpt_Logistic extends Department {

    constructor(dptRoom: string) {
        super(dptRoom, 'dpt_logistic');
    }

    protected actualizeCreepNumber() {
        //throw new Error("Method not implemented.");
        const rclEnergy = dpt_config.getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
        if (rclEnergy == 1) {
            const source: LogisticSourceTask = {
                id: null, 
                roomName: null,
                pos: null
            }
            const data: LogisticData = {
                source: source,
                target: null
            }

            this.sendToSpawnInitializacion('Queen'+'_'+this.mainRoom, 'transporter',  data, 'dpt_logistic');

            const creepName1 = this.uid();
            this.sendToSpawnInitializacion(creepName1, 'transporter',  data, 'dpt_logistic');
            const creepName2 = this.uid();
            this.sendToSpawnInitializacion(creepName2, 'transporter',  data, 'dpt_logistic');

        }

    } 

    public run() {

    }

}