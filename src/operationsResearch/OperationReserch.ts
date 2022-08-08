import * as utils from "./planningUtils";

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

    private buildSourceContainers() {
        const sourceContainer1Pos = utils.getContainerPos(this.mainRoom, "container_source1");
        Game.rooms[this.mainRoom].createConstructionSite(sourceContainer1Pos[0], sourceContainer1Pos[1], 'container');
        const csID1 = utils.getConstructionSideID(this.mainRoom, sourceContainer1Pos);

        const sourceContainer2Pos = utils.getContainerPos(this.mainRoom, "container_source2");
        Game.rooms[this.mainRoom].createConstructionSite(sourceContainer2Pos[0], sourceContainer2Pos[1], 'container');
        const csID2 = utils.getConstructionSideID(this.mainRoom, sourceContainer2Pos);

        


    }

    private buildUpgraderContainer() {

    }

    private leveUpAndBuildRoad() {

    }

    private buildColony() {
        const rcl:number = this.memory['rcl'];
        const fase:number = this.memory['fase'];
        switch(rcl) {
            case 0:        //new colony, only have a spawn
                if(fase == 0) this.buildSourceContainers();    
                else if (fase == 1) this.buildUpgraderContainer();  
                else this.leveUpAndBuildRoad();                    
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
        if (this.memory['rcl'] != 8 && this.memory['levelUp']) this.buildColony();

    }


}