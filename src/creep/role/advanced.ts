import { sendRequest } from "@/colony/dpt_comunication";
import { distanceTwoPoints, maxTwoNumber } from "@/roomPlanning/planningUtils";

export const TRANSFER_DEATH_LIMIT = 30;


export const deathPrepare = function(creep: Creep, sourceId: string): false {
    if (creep.store.getUsedCapacity() > 0) {
        for (const resourceType in creep.store) {

            let target: StructureStorage | StructureTerminal
            // 不是能量就放到 terminal 里
            if (resourceType != RESOURCE_ENERGY && resourceType != RESOURCE_POWER && creep.room.terminal) {
                target = creep.room.terminal
            }
            // 否则就放到 storage 或者玩家指定的地方
            //    @ts-ignore
            else target = sourceId ? Game.getObjectById<StructureStorage>(sourceId): creep.room.storage

            // 转移资源
            creep.moveTo(target.pos)
            creep.transfer(target, <ResourceConstant>resourceType)
            
            return false
        }
    }
    else {
        const taskType: LogisticTaskType = creep.memory['task']['type']
        if (taskType) {
            switch (taskType) {
                case 'TRANSFER':
                    if (creep.memory['task']['target']['amount'] != -1) {
                        const amountNewTask = creep.memory['task']['target']['amount'] - creep.memory['task']['target']['amountDone'];
                        
                        const transferTask: TransferRequest = {
                            'type': 'TRANSFER',
                            'target': {
                                'id': creep.memory['task']['target']['id'],
                                'resourceType': creep.memory['task']['target']['resourceType'],
                                'amount': maxTwoNumber(amountNewTask, 0)
                            }
                        }
                    }
                    break;
                case 'FILL':
                    break;
                    
                default:
                    break;
            }
        }
        creep.suicide();
    }

    return false
}

export const transferCreepStore = function(creep: Creep, sourceId: string): boolean {
    if (creep.store.getUsedCapacity() > 0){
        for (const resourceType in creep.store) {
            if (resourceType == 'energy') return false

            let target: StructureStorage;
            //    @ts-ignore
           target = sourceId ? Game.getObjectById<StructureStorage>(sourceId): creep.room.storage

            // 转移资源
            creep.moveTo(target.pos)
            creep.transfer(target, <ResourceConstant>resourceType)
            
            
        }
        return true;
    }
    return false;
}

export const notifyTaskComplete = function(creep: Creep) {

}

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

    transporter: (data: {}): ICreepConfig => ({
        source: creep => {
            
            if (creep.ticksToLive <= TRANSFER_DEATH_LIMIT) return deathPrepare(creep, creep.memory['task']['source'])

            const taskType = creep.memory['task']['type'];
            if (taskType) {
                if (!transferCreepStore(creep, creep.memory['task']['source'])) {
                    return transferTaskOperations[taskType].source(creep)
                }
                else return false;
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
                    creep.memory['task']['target'] = null;
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
            
            if (target) {   
                const resourceType =  creep.memory['task']['target']['resourceType'];  //@ts-ignore
                const transfer = creep.transfer(target, resourceType);
                
                const creepStorageIni = creep.store[resourceType];
                const amountNeeded:number = creep.memory['task']['target']['amount'];

                if (transfer == ERR_NOT_IN_RANGE) {
                    //const pos = new RoomPosition(creep.memory['task']['target']['pos'][0], creep.memory['task']['target']['pos'][1], creep.memory['task']['target']['roomName']);
                    //@ts-ignore
                    creep.moveTo(target);
                }
                else if (transfer == OK) {
                    creep.memory['task']['amountDone'] = creep.memory['task']['amountDone'] + creepStorageIni;
                }
                else if (transfer == ERR_FULL && amountNeeded != -1) {
                    creep.memory['task']['type'] = null;
                    creep.memory['sendTaskRequest'] = false;
                    creep.say('❌')
                    return true;
                }
                
                

                if (amountNeeded != -1) {
                    if (creep.memory['task']['amountDone'] >= amountNeeded) {   //task complete
                        creep.memory['task']['type'] = null;
                        creep.memory['sendTaskRequest'] = false;
                        return true;
                    } else return (creep.store.getUsedCapacity() <= 0);
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



export default roles;