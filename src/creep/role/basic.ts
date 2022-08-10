import { sendRequest } from "@/colony/dpt_comunication";
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
            let target: StructureContainer | Creep;
            target = Game.getObjectById(data.target as Id<StructureContainer> | Id<Creep>);
            
            
            //if target is a creep, throw a task to call a transporter
            if (!target) {
                if(!creep.memory['waiting']) {
                    //publisher.callSourceTransporter(creep);
                    sendRequest(creep.memory['roomName'], creep.memory['department'], creep.name);
                    creep.memory['waiting'] = true;
                }
            }
            /*
            else if (target instanceof Creep) {
                creep.transfer(target, RESOURCE_ENERGY)
            }
            */
            else {
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
                    console.log(1111);
                    
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
                else {
                    const pos = new RoomPosition(data.target.pos[0], data.target.pos[1], creep.memory['roomName']);
                    const container = pos.lookFor(LOOK_STRUCTURES)[0];
                    creep.memory['data']['target'] = container.id;
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