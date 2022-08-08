import { sendRequest } from "@/colony/dpt_comunication";



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