import { towerTask } from "@/colony/nameManagement";
import { Tower } from "./Tower";


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

    private checkRoads() {
        const roadList = Memory['colony'][this.mainRoom]['roomPlanning']['model']['road'];
        for (let i = 0; i < roadList.length; ++i) {
            const roadId = roadList[i]['id'];
            if (roadId) {
                const road = Game.getObjectById(roadId as Id<StructureRoad>);
                if (road.hits < road.hitsMax - 800) {
                    Tower.sendRoadRepairTask(this.mainRoom, roadId);
                }
            }
        }

        //check Container
        const containerList = Memory['colony'][this.mainRoom]['roomPlanning']['model']['container'];
        for (let i = 0; i < containerList.length; ++i) {
            const containerId = containerList[i]['id'];
            if (containerId) {
                const container = Game.getObjectById(containerId as Id<StructureContainer>);
                if (container.hits < container.hitsMax - 800) {
                    Tower.sendRoadRepairTask(this.mainRoom, containerId);
                }
            }
        }


    }

    private findHostileCreeps() {
        const room = Game.rooms[this.mainRoom];
        const targets = room.find(FIND_HOSTILE_CREEPS);

        for (let i = 0; i < targets.length; ++i) {
            Tower.sendAttackTask(this.mainRoom, targets[i].id);
        }
    }

    public run() {
        //realise fill task
        if (Game.time % 3 == 0) {
            this.checkRoomEnergy();
        } 

        if (Game.time % 7 == 0) {
            this.findHostileCreeps();
        }

        // room fase change
        if (Game.time % 53 == 0) {
            this.checkRCL();
        }

        //road repair
        if (Game.time % 7919 == 0) {
            this.checkRoads();
        }

        



    }


}