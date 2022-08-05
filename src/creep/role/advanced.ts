export const advanced: {
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
            const sourceData = creep.memory['task']['source'];
            if (sourceData) return true//transferTaskOperations[task.type].source(creep, task, data.sourceId)
            else creep.say('💤')
        },
        target: creep => {

            return false;
        }
    })




}
