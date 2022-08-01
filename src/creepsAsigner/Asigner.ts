/*
    Notify creeps needed to every department
*/

export class Asigner {
    private mainRoom: string;
    private memory: {};
    constructor(mainRoom: string) {
        this.mainRoom = mainRoom;
        this.memory = Memory['colony'][mainRoom]['assigner'];
    }

    private generateConfigName() {
        return ('C'+Math.random().toString(36).substr(2,9));
    }

    private sendConfig(creepConfig: creepConfig, dpt: string): void {
        const configName = this.generateConfigName();
        Memory['colony'][dpt][creepConfig][configName] = {
            'prepare': creepConfig.prepare,
            'source': creepConfig.source,
            'target': creepConfig.target
        }
    }



    private asignHarvester() {
        
    }

    
}
