import { sendLogisticTask } from "@/colony/dpt_comunication";
import { logisticTaskName } from "@/colony/nameManagement";

export class CreepSpawning {
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
                missingCreepsId.push(attackTarget[taskName]);
            }
            
        }
        return attacked;
        
    }

    private towerRepair() {
        const repairRoad = this.memory['repairRoad'];
        for (let taskName in repairRoad) {
            const road = Game.getObjectById(repairRoad[taskName])
            

        }
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