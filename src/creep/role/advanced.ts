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


}