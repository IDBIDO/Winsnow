import { sendRequest } from "@/colony/dpt_comunication";
import { distanceTwoPoints } from "@/roomPlanning/planningUtils";



const roles: {
    [role in AdvancedRoleConstant]: (data: {}) => ICreepConfig
} = {


    manager: (data: string): ICreepConfig => ({
        source: creep => {
            
            return true;
        },
        target: creep => {

            return false;
        }
    }),

    worker: (data: string): ICreepConfig => ({
        source: creep => {
            const task = creep.memory['task'];
            if (task['target']['id'] == null) {
                if (creep.memory['waiting'])  creep.say('zz');
                else {
                    sendRequest(creep.memory['roomName'], 'dpt_build', creep.name);
                    creep.memory['waiting'] = true;        //dpt_build will change to false
                }
                return false;
            }
            else {
                const taskType:WorkerTaskType = task['type'];
                return workerTaskOperation[taskType].source(creep)
            }

        },
        target: creep => {
            const taskType = creep.memory['task']['type'];

            return workerTaskOperation[taskType].target(creep);
        }
    }),

    transporter: (data: {}): ICreepConfig => ({
        source: creep => {
            
            
            const taskType = creep.memory['task']['type'];
            if (taskType) {
                
                return transferTaskOperations[taskType].source(creep)
            }
            else {
                
                //send task 
                if (creep.memory['sendTaskRequest']) {
                    creep.say('💤')
                }
                else {
                    creep.say('✉️')
                    sendRequest(creep.memory['roomName'], 'dpt_logistic', creep.name);
                    creep.memory['sendTaskRequest'] = true;
                }
                return false;
            }
            
        },
        target: creep => {
            
 
            const taskType:string = creep.memory['task']['type'];
            
            if (taskType) {
 
                
                return transferTaskOperations[taskType].target(creep)
            }
            else return true;       //get new task
            
        }
    })
}

export const transferTaskOperations: { [task in LogisticTaskType]: transferTaskOperation
} = {
    FILL: {
        source: (creep:Creep) => {
            
            const source = Game.getObjectById(creep.memory['task']['source']);
            //@ts-ignore
            if (creep.withdraw(source, 'energy') == ERR_NOT_IN_RANGE) { //@ts-ignore
                creep.moveTo(source);
            
            }


            return creep.store.getFreeCapacity() <= 0;
        },
        target: (creep:Creep) => {
            const targetID =  creep.memory['task']['target'];
            let target: StructureExtension
            if (targetID) {
                target = <StructureExtension>Game.getObjectById(targetID)
                if (!target || target.structureType !== STRUCTURE_EXTENSION || target.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
                    delete creep.memory['task']['target']
                    target = undefined
                }
            }
                           // 没缓存就重新获取
            if (!target) {
                
                
                // 获取有需求的建筑
                target = <StructureExtension>creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    // extension 中的能量没填满
                    filter: s => ((s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) && (s.store.getFreeCapacity(RESOURCE_ENERGY) > 0))
                })
                
                if (!target) {
                    // 都填满了，任务完成
                    //creep.room.deleteCurrentRoomTransferTask()
                    //set fill task to true
                    Memory['colony'][creep.memory['roomName']]['dpt_logistic']['fillTask'] = false;
                    creep.memory['task']['type'] = null;
                    creep.memory['sendTaskRequest'] = false;
                    return true
                }

                // 写入缓存
                creep.memory['task']['target'] = target.id

            }
            

            /*
            const target = <StructureExtension>creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: s => ((s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) && (s.store.getFreeCapacity(RESOURCE_ENERGY) > 0))
            })
            */

            creep.moveTo(target.pos)
            const result = creep.transfer(target, RESOURCE_ENERGY)
            if (result === ERR_NOT_ENOUGH_RESOURCES || result === ERR_FULL) return true
            else if (result != OK && result != ERR_NOT_IN_RANGE) creep.say(`拓展填充 ${result}`)

            if (creep.store[RESOURCE_ENERGY] === 0) return true
            

            return false;
        }
        
    },
    


    MOVE: {
        source: (creep:Creep) => {
            creep.say('💤');
            return false;
        },
        target: (creep:Creep) => {

            return false;
        }
        
    },
    TRANSFER: {
        source: (creep:Creep) => {
            const source = Game.getObjectById(creep.memory['task']['source'])
            //CHECK IF CREEP STORAGE IS EMPTY

            //@ts-ignore
            if (creep.withdraw(source, creep.memory['task']['target']['resourceType']) == ERR_NOT_IN_RANGE) {//@ts-ignore
                creep.moveTo(source)
            }
            return creep.store.getFreeCapacity() <= 0;
        },
        target: (creep:Creep) => {
            const target = Game.getObjectById(creep.memory['task']['target']['id']);
            
            if (target) {    //@ts-ignore
                const transfer = creep.transfer(target, creep.memory['task']['target']['resourceType']);
                
                const creepStorageIni = creep.store.getUsedCapacity();
                if (transfer == ERR_NOT_IN_RANGE) {
                    //const pos = new RoomPosition(creep.memory['task']['target']['pos'][0], creep.memory['task']['target']['pos'][1], creep.memory['task']['target']['roomName']);
                    //@ts-ignore
                    creep.moveTo(target);
                }
                else if (transfer == OK) {
                    creep.memory['amountDone'] = creep.memory['amountDone'] + creepStorageIni;
                }
                

                const amountNeeded:number = creep.memory['task']['target']['amount'];
                if (amountNeeded != -1) {
                    if (creep.memory['amountDone'] >= amountNeeded) {   //task complete
                        creep.memory['task']['type'] = null;
                        return true;
                    }else return (creep.store.getUsedCapacity() <= 0);
                }
                else return (creep.store.getUsedCapacity() <= 0);

            }
            else {  //reset task
                creep.memory['task']['type'] = null;
                creep.memory['sendTaskRequest'] = false;
                creep.say('❌')
                return true;
            }

           
        
        }
        
    },
    WITHDRAW: {
        source: (creep:Creep) => {
            return false;
        },
        target: (creep:Creep) => {
            return false;
        }
        
    }

}

export const workerTaskOperation: { [task in WorkerTaskType]: workerTaskOperation
} = {
    BUILD: {
        source: (creep: Creep) => {
            const pos = creep.memory['task']['target']['pos'];
            const targetPos = new RoomPosition(pos[0], pos[1], creep.memory['roomName']);
            if (creep.pos.inRangeTo(targetPos, 3)) return true;
            else return false;
        },
        target: (creep: Creep) => {
            const target = Game.getObjectById(creep.memory['task']['target']['id']);
            if (target) {   //@ts-ignore
                creep.build(target);
                return false;
            }
            else {
                //notify contruction completation
            }
        }
    },
    REPAIR:{
        source: (creep: Creep) => {
            return false;
        },
        target: (creep: Creep) => {
            return false;
        }
    }
}


export default roles;