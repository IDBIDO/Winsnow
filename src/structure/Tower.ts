import { sendLogisticTask } from "@/colony/dpt_comunication";
import { logisticTaskName, towerTask } from "@/colony/nameManagement";

export class Tower {
    mainRoom: string;       
    memory: {};

    constructor(mainRoom: string) {
        this.mainRoom = mainRoom;
        this.memory = Memory['colony'][mainRoom]['tower'];
    }
    /*
        id {
            energyPetition: boolean,
            task,
        }

    */

    /*
        Una torreta cada 7 tick revisa su energia, si es inferiol a un valor dado,
        hace una peticion de transferencia a Dpt_logistic.
        Mientras no le llegue toda la energia que ha pedido, no lanza ninguna 
        peticion de energia. 
        
    */
    
    
    private checkTowerEnergy() {
        const towerMem = this.memory['memory'];
        for (let id in towerMem) {
            
            if (!towerMem['energyPetition']) {  //@ts-ignore
                const tower = Game.getObjectById(id);   //@ts-ignore
                if (tower.store['energy'] <= 700) {
                    //SEND TASKFER REQUEST
                    const transferTask: TransferRequest = {
                        'type': 'TRANSFER',
                        'target': {
                            'id': id,
                            'resourceType': 'energy',           //@ts-ignore
                            'amount': tower.store.getFreeCapacity()
                        }
                        
                    }
                    sendLogisticTask(this.mainRoom, logisticTaskName(transferTask), transferTask);
                    this.memory['memory']['energyPetition'] = true;
                }
            }
            
            
        }
    }

    private towerAttack(): boolean {
        const towersData = this.memory['data'];
        const attackTarget = this.memory['attackTask'];

        let missingCreepsId = [];
        let attacked = false;
        for (let taskName in attackTarget) {
            const hostileCreep = Game.getObjectById(attackTarget[taskName] as Id<Creep>)
            if (hostileCreep) {
                for (let towerId in towersData) {
                    const tower = Game.getObjectById(towerId as Id<StructureTower>)
                    tower.attack(hostileCreep);
                }
                attacked = true;
            }
            else {
                missingCreepsId.push(taskName);
            }
            
        }

        for (let i = 0; i < missingCreepsId.length; ++i) {
            delete this.memory['attackTask'][missingCreepsId[i]];
        }

        return attacked;
        
    }

    static sendRoadRepairTask(roomName: string, roadId: string) {
        const taskname = towerTask();
        Memory['colony'][roomName]['tower']['repairRoad'][taskname] = roadId;
    }

    static cleanTowerEnergyPetition(roomName: string, towerId: string) {
        Memory['colony'][roomName]['tower']['data'][towerId]['energyPetition'] = false;

    }

    static sendRampartRepairTask(roomName: string, rampartId: string) {
        const taskname = towerTask();
        Memory['colony'][roomName]['tower']['repairRampart'][taskname] = rampartId;
    }    

    static sendAttackTask(roomName: string, creepId: string) {
        const taskName = towerTask();
        Memory['colony'][roomName]['tower']['attackTask'][taskName] = creepId;
    }

    private towerRepair() {
        const repairRoad = this.memory['repairRoad'];
        const towersData = this.memory['data'];
        const towersId = Object.keys(towersData);
        let i = 0;
        let deleteRepairTask = [];
        for (let taskName in repairRoad) {
            if (i < towersId.length) break;

            const road = Game.getObjectById<StructureContainer|StructureRoad>(repairRoad[taskName]);
            let repairTime = ~~((road.hitsMax - road.hits)/800);

            while(i < towersId.length && repairTime) {
                const tower = Game.getObjectById(towersId[i] as Id<StructureTower>);
                tower.repair(road);
                --repairTime;
                ++i;
            }
            if (!repairTime) {
                deleteRepairTask.push(this.memory['repairRoad'][taskName]);
            }

        }

        //delete road or container tasks
        for (let j = 0; j < deleteRepairTask.length; ++j) {
            delete repairRoad[deleteRepairTask[j]];
        }

        //repair rampart task
        
    }

    private towerTaskExecution() {
        if (!this.towerAttack()) {
            this.towerRepair();
        }
    }
    
    public run() {
        if (Game.time % 7 == 0) this.checkTowerEnergy();
        //this.towerAssignRepairTask();
        this.towerTaskExecution();
    }



}