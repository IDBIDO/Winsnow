
export class OperationReserch {

    mainRoom: string;
    memory: {};

    constructor(mainRoom: string) {
        this.mainRoom = mainRoom;
        this.memory = Memory['colony'][this.mainRoom]['state'];
    }

    /*
    state {
        rcl: number
        fase: number

    }
    */
    private buildColony() {
        const rcl:number = this.memory['rcl'];
        switch(rcl) {
            case 0:        //new colony, only have a spawn
                                //fase 0: build sourceContainers
                                //fase 1: build upgraderContainer
                                //fase 2: level up controller to Lv.2
                break;
            case 1:        

                break;
            case 2:
                break;
            case 3: 
                break;
            case 4:
                break;
            case 5:
                break;

            case 6: 
                break;
            case 7:
                break;

        }
    }

    run() {
        if (this.memory['rcl'] != 8) this.buildColony();

    }


}