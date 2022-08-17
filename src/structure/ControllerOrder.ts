export class ControllerOrder {
    private mainRoom: string;
    private controller: StructureController;
    private memory: {};

    constructor(roomName: string) {
        this.mainRoom = roomName;
        this.controller = Game.rooms[roomName].controller;
        this.memory = Memory['colony'][roomName]['state']['controller'];
    }

    private sendFillTask(): void {
        Memory['colony'][this.mainRoom]['dpt_logistic']['fillTask'] = true;
    }

    private checkRoomEnergy(): void {
        const energyCapacity = Game.rooms[this.mainRoom].energyCapacityAvailable
        const energyAvailable = Game.rooms[this.mainRoom].energyAvailable;
        if (energyAvailable < energyCapacity) {
            this.sendFillTask();
            this.memory['fillTaskTTL'] = Game.time + 50;
        }
        else {
            this.memory['fillTaskTTL'] = -1;
        }
    }

    public run() {
        if (Game.time % 7 == 0) {
            //if (Game.time > this.memory['fillTaskTTL']) {
                this.checkRoomEnergy();
            //}
        } 


    }


}