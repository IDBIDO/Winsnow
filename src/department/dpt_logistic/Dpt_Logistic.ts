import { Department } from "../Department";
import * as dpt_config from "@/department/dpt_config"
import { moveRequest } from "@/colony/dpt_comunication";


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

    private getSourceTask() {
        const requestList = this.memory['sourceTask'];
        if (Object.keys(requestList).length === 0) {
            return null;
        }
        else return requestList[0];
    }

    /** Dpt_logistic creaat move task to reply a request */
    private creatMoveTask(moveTask: MoveRequest): LogisticMoveTask {
        const storage = Game.rooms[this.mainRoom].storage
        if (storage) {
            const task: LogisticMoveTask = {
                type: 'MOVE',
                source: moveTask.source,
                target: {
                    id: storage.id
                }
            }
            return task;
        }
        //!!!!!!!! PUEDE DAR ERROR SI RCL > 5
        else {
            const targetTaskList = this.memory['targetTask'];
            const taskName = Object.keys(targetTaskList);
            if (taskName.length) {
                targetTaskList[taskName[0]];
                const task: LogisticMoveTask = {
                    type: 'MOVE',
                    source: moveTask.source,
                    target: {
                        id: targetTaskList[taskName[0]]
                    }
                }
                return task;
            }
            else return null;
        }
        
    }

    private processRequest() {
        const requestList = this.memory['request'];


    }

    public run() {

    }

}