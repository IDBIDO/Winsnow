import { sendRequest } from "@/colony/dpt_comunication";

export function getfirstSpawnName(roomName: string) {
    return Memory['colony'][roomName]['creepSpawning']['spawn'][0];
}

const roles: {
    [role in AdvancedRoleConstant]: (data: {}) => ICreepConfig
} = {
    queen: (data: string): ICreepConfig => ({
        source: creep => {

            if (creep.ticksToLive < 200 && 
            creep.memory['task'] == null &&
            Game.rooms[creep.memory['roomName']].energyAvailable >= 300) {
                //CREEP RENEW PROCESS
                if (!creep.memory['renewing']) {
                    creep.memory['renewing'] = true;

                } 


                const spawnName = getfirstSpawnName(creep.memory['roomName']);
                const spawn = Game.spawns[spawnName];
                if (!creep.pos.isNearTo(spawn.pos)) creep.moveTo(spawn);
                else return true;

                //else creep.say('♻️');
                
            }

            else {
                //
                return (roles['transporter']({}).source(creep));
            }


            return true;
        },
        target: creep => {
            if (creep.ticksToLive < 200 && 
                creep.memory['task'] == null &&
                Game.rooms[creep.memory['roomName']].energyAvailable >= 300) {

                    if (creep.memory['renew']) return false;
                    else return true;
                }
            else {
                return (roles['transporter']({}).target(creep));
            }

            return false;
        }
    }),

    manager: (data: string): ICreepConfig => ({
        source: creep => {
            
            return true;
        },
        target: creep => {

            return false;
        }
    }),

    transporter: (data: string): ICreepConfig => ({
        source: creep => {
            /*
            const sourceData = creep.memory['task']['source'];
            let move = 'MOVE';
            if (sourceData) return transferTaskOperations[move].source(creep)
            else {
                creep.say('💤')
                return true;
            }
            */
           creep.say('zz')
            return false;
            if (creep.memory['task'] = null) {
                if (creep.memory['sleeping']) {
                    creep.say('💤');
                    return false;
                }
                else return true;        //change to target to getTask
            }
            else {  
                if (creep.memory['sleeping']) creep.memory['sleeping'] = false;
                //WORKING CODE
                const taskType:string = creep.memory['task']['type'];
                return transferTaskOperations[taskType].source(creep)
            }
            
        },
        target: creep => {
            
            if (creep.memory['task'] = null) {
                sendRequest(creep.memory['roomName'], creep.memory['department'], creep.name)
                creep.memory['sleeping'] = true;
                return true;
            }
            else {
                //WORKING CODE
                const taskType:string = creep.memory['task']['type'];
                return transferTaskOperations[taskType].source(creep)
            }
            

            return false;
        }
    })




}

export const transferTaskOperations: { [task in LogisticTaskType]: transferTaskOperation
} = {
    MOVE: {
        source: (creep:Creep) => {
            creep.say('💤');
            return false;
            /*
            const sourceData = creep.memory['task']['source'];
            const targetPos:RoomPosition = new RoomPosition(sourceData['pos'][0], sourceData['pos'][1], sourceData['roomName'])
            creep.moveTo(targetPos)
            if (creep.pos.isNearTo(targetPos)) {
                return true;
            }
            return false;
            */
        },
        target: (creep:Creep) => {
            const targetData = creep.memory['task']['target'];
            const target = Game.getObjectById(targetData['id']);
            if (target) {
                
                
            }
            return false;
        }
        
    },
    TRANSFER: {
        source: (creep:Creep) => {
            return false;
        },
        target: (creep:Creep) => {
            return false;
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