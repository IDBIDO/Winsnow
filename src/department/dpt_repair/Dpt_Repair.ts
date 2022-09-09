import { repairerTaskName } from "@/colony/nameManagement";
import { getRampartDataByReference } from "@/colony/planningUtils";
import { translateNodeToPos } from "@/roomPlanning/planningUtils";
import { CreepSpawning } from "@/structure/CreepSpawning";
import { Department } from "../Department";


export const MaxHitsNuker = 10000000
export const MaxHitsWall = 20000000
export const MaxHitsInvader = 2000000

export const RepairCreepNum = 1;

export default class Dpt_Build extends Department {
    
    
    constructor(dptRoom: string) {
        super(dptRoom, 'dpt_build');
    }

    

    static sendToSpawnRepairer(roomName: string) {
        
    }

    private getWallRampartLinkPos(ref: number): [number, number] {
        const linkPosData = this.memory['linkPosData'];
        const linkPosDataKeys = Object.keys(linkPosData);
        for (let i = 0; i < linkPosDataKeys.length; ++i) {
            for (let j = 0; j < linkPosData[i].length; ++j) {
                if (linkPosData[i] == ref) {
                    const linkPos = translateNodeToPos(parseInt(linkPosDataKeys[i]));
                    return linkPos;
                }
            }
        }
        return null;    //teoricamente imposible de alcanzar
    }

    private createWallRampartTask() {
        const rampartList = Memory['colony'][this.mainRoom]['roomPlanning']['model']['rampart'];
        const repairLinkPos = this.memory['linkPosData'];
        const wallHits = this.memory['wallHits']
        if(this.memory['wallHitsUpdate']) {
            for (let linkPosNode in repairLinkPos) {
                for (let i = 0; i < repairLinkPos[linkPosNode]; ++i) {
                    const rampartData = getRampartDataByReference(this.mainRoom, i);
                    if (rampartData.id) {
                        const rampart = Game.getObjectById(rampartData.id as Id<StructureRampart>);
                        if (rampart && rampart.hits < wallHits) {
                            //publish repair task
                            let source;
                            if (Game.rooms[this.mainRoom].controller.level < 8) source = null;
                            const rampartTask: RampartRepairTask = {
                                'source': source,
                                'target': rampart.id,
                                'hits': wallHits + Math.trunc(wallHits*10/100),
                                'linkPos': this.getWallRampartLinkPos(i)
                            }
                            const taskName = repairerTaskName();
                            this.memory[taskName] = rampartTask;
                        }
                    }

                }
            }
            this.memory['wallHitsUpdate'] = false;

        }
        

    }

    private actualizeRampartData() {
        const rampartList = Memory['colony'][this.mainRoom]['roomPlanning']['model']['rampart'];
        for (let i = 0; i < rampartList.length; ++i) {
            const rampartId = rampartList[i]['id'];
            if (rampartId && !this.memory['rampartData'][rampartId]) {
                this.memory['rampartData'][rampartList[i]['id']] = i;       //rampart id: rampart reference
            }
        }
    }

    private actualizeWallHits() {
        const wallHits = this.memory['wallHits'];
        
        //max wallHits 50M
        if (wallHits > 50000000) return 

        //task imcomplete 
        const taskList = Object.keys( this.memory['task'] );
        if (taskList.length) return 

        if (wallHits < 100000) {
            this.memory['wallHits'] = 100000;  //initialize
            this.memory['wallHitsUpdate'] = true;
        }
        else {
            //check if all wall rampart's hits > a
            const rampartList = this.memory['rampartData'];

            let upgradeWallHits = true;
            for (let rampartId in rampartList) {
                const rampart = Game.getObjectById(rampartId as Id<StructureRampart>);
                if (rampart.hits < wallHits) upgradeWallHits = false;
            }

            if (upgradeWallHits) {
                this.memory['wallHitsUpdate'] = true;
                const upgradeValue = wallHits*2;
                if (upgradeValue < 5000000) this.memory['wallHits'] = wallHits*2;
                else this.memory['wallHits'] = 5000000;
            }
            

        }
    }

    private getCreepsAliveOrSpawning(): number {
        return 1;
    }

    private repairerCreepNumControl() {
        const creepsAliveOrSpawning = this.getCreepsAliveOrSpawning();
        if (creepsAliveOrSpawning < RepairCreepNum) {
            //send to spawn repairer

        }

    }

    public run() {

        if (Game.time % 167 == 0) {
            this.actualizeWallHits();
        }

        if (Game.time % 1061) {
            //this.actualizeRampartData();
        }

        if( Game.time % 23 == 0) {
            this.createWallRampartTask();
        }

        if(Game.time % 3 == 0) {
            this.repairerCreepNumControl();
        }
    }
}
    