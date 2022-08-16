import { sendLogisticTask, sendORBuildingTaskCompletation, sendRequest } from "@/colony/dpt_comunication";
import { logisticTaskName } from "@/colony/nameManagement";
import { getContainerIndex, saveStructureID } from "@/colony/planningUtils";
import * as publisher from "../taskPublisher";

const roles:{
    [role in BaseRoleConstant]: (data: {}) => ICreepConfig
} = {
    colonizer: (data: SourceTargetData): ICreepConfig => ({
        source: creep => {
            const source = Game.getObjectById(data.source as Id<Source>);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
            return creep.store.getFreeCapacity() <= 0;
        },
        target: creep => {
            const cSide = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
            const controller = Game.rooms[creep.room.name].controller;
            if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) creep.moveTo(controller);

            /*
            if (cSide) {
                if (creep.build(cSide) == ERR_NOT_IN_RANGE) creep.moveTo(cSide);
            }
            */
           
            return (creep.store.getUsedCapacity() <= 0);
        }


        

    }),


    builder: (data: {}): ICreepConfig => ({

        source: creep => {
            const target = creep.memory['task']['target'];
            if (target['id']) {         
                const contructionSide = Game.getObjectById(target['id']);
                //task no complete
                if (contructionSide) {  //@ts-ignore

                    //send logistic request
                    if (!creep.memory['sendLogisticRequest']) {
                        const request: TransferRequest = {
                            'type': 'TRANSFER',
                            'target': {
                                'id': creep.id,
                                'resourceType': 'energy',
                                'amount': -1
                            }
                        }
                        creep.say('LogisticTask Sended')
                        sendLogisticTask(creep.memory['roomName'], logisticTaskName(request), request);
                        creep.memory['sendLogisticRequest'] = true;
                    }

                        //@ts-ignore
                    if (creep.pos.inRangeTo(contructionSide, 3)) return true; 
                    else {      //@ts-ignore
                        creep.moveTo(contructionSide, {ignoreCreeps: false})
                        return false;
                    }
                }
                else {    //constructionSide complete, delete creep.memory
                    creep.memory['task']['target']['id'] = null;
                    creep.memory['task']['target']['pos'] = null;
                    creep.memory['task']['target']['roomName'] = null;
                    return false;
                }
            }
            else {  //no target, try to find a target
                if (Game.time % 13 == 0) {
                    
                    const closeContructionSide = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                    if (closeContructionSide) {
                        //console.log(creep.memory['task']['target']['id']);
                        
                        creep.memory['task']['target']['id'] = closeContructionSide.id;
                        creep.memory['task']['target']['pos'] = [closeContructionSide.pos.x, closeContructionSide.pos.y];
                        creep.memory['task']['target']['roomName'] = closeContructionSide.room;
                        
                    }
                    else {
                        //send task request to dpt_build
                        //this request will be delete if departament do not have task to offer
                        //sendRequest(creep.memory['roomName'], 'dpt_build', creep.name);  
                    }
                }
                else creep.say('💤');
                return false;
            }


        },
        target: creep => {
            const target = Game.getObjectById(creep.memory['task']['target']['id'] as Id<ConstructionSite>);
            
            if (target) {
                const r = creep.build(target);
                if (r == ERR_NOT_ENOUGH_ENERGY) creep.say('⚡')
                else if (r == ERR_NOT_IN_RANGE) creep.moveTo(target, {ignoreCreeps: true})
                
                return false;
            }
            else {      //contructionside complete, change state to source to get new task
                
                creep.memory['task']['target']['id'] = null;
                creep.memory['task']['target']['pos'] = null;
                creep.memory['task']['target']['roomName'] = null;
                return true;
            }

            //return creep.store[RESOURCE_ENERGY] <= 0
        }
    }),

    harvester: (data: HarvesterData): ICreepConfig => ({
        source: creep => {
            const source = Game.getObjectById(data.source as Id<Source>);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
            //change state if creep store max
            return creep.store.getFreeCapacity() <= 0;
        },
        target: creep => {
            let target: StructureContainer | StructureLink;
            target = Game.getObjectById(data.target as Id<StructureContainer> | Id<StructureLink>);
            
            /*  CODE FOR REMOTEHARVESTER
            //if target is a creep, throw a task to call a transporter
            if (!target) {
                if(!creep.memory['waiting']) {
                    //publisher.callSourceTransporter(creep);
                    sendRequest(creep.memory['roomName'], creep.memory['department'], creep.name);
                    creep.memory['waiting'] = true;
                }
            }
            */

            /*
            else if (target instanceof Creep) {
                creep.transfer(target, RESOURCE_ENERGY)
            }
            */
            if (target) {
                creep.transfer(target, RESOURCE_ENERGY)
            }

            return (creep.store.getUsedCapacity() <= 0);
        }


        

    }),

    
    initializer: (data: InitializerData): ICreepConfig => ({
        source: creep => {
            const source = Game.getObjectById(data.source as Id<Source>);
            
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }

            return creep.store.getFreeCapacity() <= 0;
        },
        target: creep => {
            
            const queen = Game.creeps['Queen' + creep.room.name];
            
                if (queen && creep.pos.isNearTo(queen.pos)) {
                    
                    
                    creep.transfer(queen, 'energy');
                }
                
            

            else {
                const target = Game.getObjectById(data.target.id as Id<_HasId>)
                if (target) {
                    if (target instanceof ConstructionSite) {
                        creep.build(target);
                    }
                    else if (target instanceof Structure) {
                        creep.transfer(target, 'energy');
                    }

                }
                else {      //CHANGE ROLE TO HARVESTER
                    
                        const pos = new RoomPosition(data.target.pos[0], data.target.pos[1], creep.memory['roomName']);
                        const container = pos.lookFor(LOOK_STRUCTURES)[0];
                        creep.memory['task']['target'] = container.id;

                        creep.memory['role'] = 'harvester'
                    
                }
            }
            return (creep.store.getUsedCapacity() <= 0);
        }


        

    }),
    
    iniQueen: (data: {}): ICreepConfig => ({
        source: creep => {
            
            const nearInitializer = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: function(target) {
                    return target.name != creep.name;
                }
            });
            if (nearInitializer) {
                //console.log(creep.moveTo(nearInitializer));
                
                
                creep.moveTo(nearInitializer);
            }

        // 自己身上的能量装满了，返回 true（切换至 target 阶段）
        return creep.store.getFreeCapacity() <= 0;
        },
        target: creep => {
            const nearSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            if (nearSpawn) {
                if (nearSpawn.store.getFreeCapacity('energy') > 0) {
                    
                    if (creep.transfer(nearSpawn, 'energy') == ERR_NOT_IN_RANGE) {
                        creep.moveTo(nearSpawn);

                    }
                }
            }

            if (Game.time % 7 == 0) {
                const containers = creep.room.find(FIND_STRUCTURES, {
                    filter:{structureType: STRUCTURE_CONTAINER}
                })
                if (containers.length >= 2) {       //fase 1 finished
                    
                    
                    sendORBuildingTaskCompletation(creep.memory['roomName']);     //send task complet mens. to OR

                    //save id to planning model
                    const sourceContainer1Index = getContainerIndex(creep.room.name, 'container_source1');
                    console.log(sourceContainer1Index);
                    
                    
                    saveStructureID(creep.room.name, 'container', sourceContainer1Index, containers[0].id);

                    const sourceContainer2Index = getContainerIndex(creep.room.name, 'container_source2');
                    saveStructureID(creep.room.name, 'container', sourceContainer2Index, containers[1].id);

                    Memory['colony'][creep.memory['roomName']]['dpt_logistic']['storage'].push(containers[0].id);
                    Memory['colony'][creep.memory['roomName']]['dpt_logistic']['storage'].push(containers[1].id);

                    creep.memory['role'] = 'transporter';   //change queen role to transporter
                    
                }   
            };
            

            return creep.store[RESOURCE_ENERGY] <= 0
        }
    }),
//Game.creeps['QueenW2N5'].memory['role] = 'iniQueen
    /*
    transporter: (data: LogisticData): ICreepConfig => ({
        source: creep => {
            const sourceID = creep.memory['data']['source']['id'];
            const source = Game.getObjectById(sourceID);
            if (source instanceof Creep) {
                creep.moveTo(source);
            }
    
            return false;
        },
        target: creep => {
            return false;
        }

    }),
    */
}
export default roles;