import * as publisher from "../taskPublisher";

export const basic:{
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
        return creep.store.getFreeCapacity() <= 0

            return true;
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
                    publisher.callSourceTransporter(creep);
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

    transporter: (data: LogisticData): ICreepConfig => ({
        source: creep => {
            return false;
        },
        target: creep => {
            return false;
        }

    }),
}