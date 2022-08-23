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
            //this.memory['fillTaskTTL'] = Game.time + 50;
        }
        else {
            //this.memory['fillTaskTTL'] = -1;
        }
    }

    private checkRCL() {
        const actualRCL = this.memory['actualRCL'];
        const rcl = Game.rooms[this.mainRoom].controller.level
        if (rcl > actualRCL) {
            this.memory['actualRCL'] = rcl;
            Memory['colony'][this.mainRoom]['state']['buildColony']['task']['levelUP'] = true;
        }
    }

    public run() {
        if (Game.time % 3 == 0) {
            this.checkRoomEnergy();
        } 

        if (Game.time % 53 == 0) {
            this.checkRCL();
        }



    }


}