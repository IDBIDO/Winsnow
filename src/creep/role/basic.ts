import { sendORBuildingTaskCompletation, sendRequest } from "@/colony/dpt_comunication";
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


    builder: (data: SourceTargetData): ICreepConfig => ({
        source: creep => {
            const source = Game.getObjectById(data.source as Id<Source>);

            if (creep.harvest(source) == ERR_NOT_IN_RANGE) creep.moveTo(source);

        // 自己身上的能量装满了，返回 true（切换至 target 阶段）
        return creep.store.getFreeCapacity() <= 0;
        },
        target: creep => {
            const target = Game.getObjectById(data.target as Id<ConstructionSite>);
            if (creep.build(target) == ERR_NOT_IN_RANGE) creep.moveTo(target);

            return creep.store[RESOURCE_ENERGY] <= 0
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
                        creep.memory['data']['target'] = container.id;

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
                    creep.memory['role'] = 'transporter';   //change queen role to transporter
                    sendORBuildingTaskCompletation(creep.room.name);     //send task complet mens. to OR

                    //save id to planning model
                    const sourceContainer1Index = getContainerIndex(creep.room.name, 'container_source1');
                    saveStructureID(creep.room.name, 'container', sourceContainer1Index, containers[0].id);

                    const sourceContainer2Index = getContainerIndex(creep.room.name, 'container_source2');
                    saveStructureID(creep.room.name, 'container', sourceContainer2Index, containers[1].id);

                    
                }
            };
            

            return creep.store[RESOURCE_ENERGY] <= 0
        }
    }),

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