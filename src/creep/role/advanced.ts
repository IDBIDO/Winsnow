


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
            return transferTaskOperations['MOVE'].source(creep)
            
        },
        target: creep => {



            return false;
        }
    })




}

export const transferTaskOperations: { [task in LogisticTaskType]: transferTaskOperation
} = {
    MOVE: {
        source: (creep:Creep) => {
            
            creep.say('💤')

            return false;
        },
        target: (creep:Creep) => {
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