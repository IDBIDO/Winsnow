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
        const keys = Object.keys(requestList);
        if (keys.length === 0) {
            return null;
        }
        else return requestList[keys[0]];
    }

    private getTransferTask() {
        const requestList = this.memory['transferTask'];
        const keys = Object.keys(requestList);
        if (keys.length === 0) {
            return null;
        }
        else return requestList[keys[0]];
    }

    private getStorageID(): string {
        const storageList = this.memory['storage'];
        if (storageList.length == 1) {
            return storageList[0];
        }
        else {
            let maxCapacityUsedStorageIndex = 0;
            for (let i = 1; i < storageList.length; ++i) {
                const storage= Game.getObjectById(storageList[i]);// @ts-ignore
                const actualStorage= Game.getObjectById(storageList[maxCapacityUsedStorageIndex]);// @ts-ignore

                if (storage.store.getUsedCapacity() > actualStorage.store.getUsedCapacity()) {
                    maxCapacityUsedStorageIndex = i;
                }
            }
            return storageList[maxCapacityUsedStorageIndex];
        }
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

    private getMaxCapacityStorageID(): string{
        const storages = this.memory['storage'];
        if (storages.length == 2) {
            const c1 = Game.getObjectById(storages[0]);
            //console.log(c1);
            
            const c2 = Game.getObjectById(storages[1]);
            //@ts-ignore
            if (c1.store.getUsedCapacity() > c2.store.getUsedCapacity()) {
                return c1.id;
            }
            else return c2.id;
        }
        else if (storages.length == 1) return storages[0].id
        else return null
    }

    private createTransferTask(transferRequest: TransferRequest): TransferTask {
        
        const r: TransferTask = {
            type: 'TRANSFER',
            source: this.getMaxCapacityStorageID(),
            target: transferRequest.target,
            amountDone: 0
        }
        return r;
    }

    private notifyCreepNameToObject(objectID: string, creepName: string) {
        //@ts-ignore
        const object = Game.getObjectById(objectID);
        if (object instanceof Creep) {
            object.memory['logisticCreepName'] = creepName;
        }


    }

    private assigTargetTask(creepName: string): boolean {
        const targetTaskList = this.memory['targetTask'];
        for (let request in targetTaskList) {
            if (request) {
                const task = this.createTransferTask(targetTaskList[request]);
                //notify task object the creep assigned to it
                this.notifyCreepNameToObject(task.target.id, creepName);
                delete this.memory['targetTask'][request];
                //assig task to logistic creep
                Game.creeps[creepName].memory['task'] = task;
                Game.creeps[creepName].memory['sendTaskRequest'] = false;
                return true;
            }
        }
        
        return false;       //no task found
    }

    private assigSourceTask(creepName: string): boolean {
        return false;
    }

    private createFillTask(): FillTask {
        const task: FillTask = {
            'type': 'FILL',
            'source': this.getMaxCapacityStorageID(),
            'target': null
        }
        return task;
    }

    private assigFillTask(creepName: string): void {
        Memory.creeps[creepName]['task'] = this.createFillTask();
    }

    private processRequest() {
        const requestList = this.memory['request'];
        const sourceTaskList = this.memory['sourceTask'];
        const targetTaskList = this.memory['targetTask'];
        for (let i = requestList.length-1; i >= 0; --i) {
            if (Game.creeps[requestList[i]]) {

                if (this.memory['fillTask']) {
                    this.assigFillTask(requestList[i]);
                    this.memory['fillTask'] = false;
                    this.memory['request'].pop();
                }

                else if (this.assigTargetTask(requestList[i])) {
                    this.memory['request'].pop();                
                }
            }
            else this.memory['request'].pop(); 

       
        }
    
        
    }

    private deleteDeadOneTimeCreeps() {
        const oneTimeCreeps = this.memory['oneTimeCreeps'];
        for (let creepName in oneTimeCreeps) {
            if (oneTimeCreeps[creepName] <= Game.time) {
                delete this.memory['oneTimeCreeps'][creepName];
                delete Memory.creeps[creepName];
            }
        }
    }

    public run() {
        this.processRequest();

        if (Game.time% 97) {
            this.deleteDeadOneTimeCreeps();
        }

    }

}