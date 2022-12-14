

interface arrayPos {
    ref: string,
    pos: [number, number]
    distance: number
}
/********************* ROLE DATA ****************/
interface InitializerData {
    source: string;
    target: {
        id: string,
        pos:[number, number]
    }
}



interface HarvesterData{
    source: string;
    target: string;
}

interface RepairerData {
    source: string,
    target: {
        id: string,
        hits: number,
        pos: string,
        roomName: string
    }
}

/*****************WORKER**************** */
interface WorkerData {
    source: string;
    target: {
        id: string;
        pos: string;
        roomName: string;
    }
}

interface BuilderData {
    source: string;
    target: {
        id: string;
        pos: string;
        roomName: string;
    }
    logisticCreepName: string,
}

interface BuildTask {
    type: BuildableStructureConstant,
    pos: [number, number],
    roomName: string,
    modelReference: number
    
}

//////**************  upgrader ****/
interface Upgrader_baseData {
    source: string;
    logisticCreepName: string
}


 
/*********************************** */

interface LogisticData {
    source: LogisticSourceTask,
    target: string
}


interface SourceTargetData{
    source: string;
    sourcePos: [number, number];
    target: string;
}

/******************** *******************/
interface Task {
    taskID: string, 
    data: TaskRequest
}


/****************************REQUEST ***********************/
type TaskRequest = 
    LogisticTaskRequest

/************* LOGISTIC REQUEST  *************/
type LogisticTaskType = 
    'MOVE' | 'TRANSFER' | 'WITHDRAW' | 'FILL'

type LogisticTaskRequest = 
    MoveRequest | TransferRequest | WithdrawRequest

interface FillTask {
    type: 'FILL',
    source: string,
    target: string
}

    
interface MoveRequestData{
    id: string;                 //object id
    pos: [number, number];      //position to move
    roomName: string;           //position's room
}   
interface MoveRequest {
    type: 'MOVE',
    source: MoveRequestData
}

interface TransferRequestData {
    id: string, 
    resourceType: ResourceConstant,
    amount: number
}
interface TransferRequest {
    type: 'TRANSFER',
    target: TransferRequestData
}

interface TransferTask {
    type: 'TRANSFER',
    source: string,
    target: TransferRequestData
    amountDone: number;
}

interface WithdrawRequestData {
    id: string, 
    resourceType: ResourceConstant,
    roomName: string, 
    pos: [number, number],
    
}
interface WithdrawRequest {
    type: 'WITHDRAW',
    source: WithdrawRequestData
}

interface WidrawTask {
    type: 'WITHDRAW',
    source: WithdrawRequestData,
    target: string,
}

interface transferTaskOperation {
         // creep ????????????????????????
    target: (creep: Creep) => boolean
    // creep ?????????(???????????????)???????????????
    source: (creep: Creep) => boolean
}

/************* BUILDER REQUEST  ***************/



/************* TASK *************/

interface LogisticSourceTask {
    id: string, 
    roomName: string,
    pos: [number, number]
}
interface LogisticMoveTask {
    type: 'MOVE',
    source: MoveRequestData
    target: {
        id: string,
    }
}



interface creepConfig {
    prepare: [number, number],
    source: string,
    target: string

}

interface Point{
    x: number;
    y: number;
}

interface AdjacentList {
    [ index:number ]: Point[]
}

interface SpawnTask {
    creepName: string;
    role: string;
    dpt: string;
    
}

interface SpawnTaskComplete {
    creepName: string;
    deadTime: number;
}

interface ICreepConfig {
    /*
    // ????????????????????????????????????????????? true ?????????????????????????????????
    isNeed?: (room: Room, creepName: string, preMemory: CreepMemory) => boolean;
    // ???????????????????????????, ?????? true ?????????????????????
    prepare?: (creep: Creep) => boolean;
    // creep ??????????????????????????????????????????
    // ?????? true ????????? target ?????????????????????????????????????????????
    */
    prepare?: (creep: Creep) => boolean

    source?: (creep: Creep) => boolean;
    // creep ????????????????????????,
    // ?????? true ????????? source ?????????????????????????????????????????????
    target: (creep: Creep) => boolean;

    // ???????????????????????????????????????
    //bodys: BodyPartConstant[];
}

type BaseRoleConstant = 
    'harvester' |
    'colonizer' |
    //'collector' |
    //'miner' |
    'upgrader_base' |
    //'filler' |
    'builder' |
    'repairer' |
    'initializer'|
    'iniQueen'

type AdvancedRoleConstant =
    'manager'|
    'transporter'
    
type CreepWork = {
    [role in CreepRoleConstant]: (data: {}) => ICreepConfig
}

// ????????? creep ??????
type CreepRoleConstant = BaseRoleConstant | AdvancedRoleConstant 

interface repairerData {
    needBost: boolean,
    labId: string,
    source: string,
    target: string

}

/******************* STRUCTURE FUNCTION ***********************/
type ContainerFunction = 
    'container_source1' |
    'container_source2' |
    'container_mineral1'|
    'container_controller'

type LinkFunction = 
    'link_source1' |
    'link_source2' |
    'link_controller1'|
    'link_center'


/************* STRUCTURE ******************/
interface towerData {
    energyPetition: boolean,
    task: towerTask,
    pos: [number, number]
}

type towerTask = towerRepairTask | towerRepairTask | towerHeal;

interface towerRepairTask {
    id: string, 
    hits: number
}

interface towerAttack {
    id: string, 

}

interface towerHeal {
    id: string, 
    hits: number
}



/*********************** */

type TransferTarget = StructureTower | Creep | StructureContainer | StructureLab | StructureStorage
type WithDrawTarget = StructureContainer | StructureStorage | StructureLab | Tombstone | Ruin



/********* Dpt_repair ************/
interface RampartRepairTask {
    source: string,
    target: string,
    hits: number, 
    linkPos: [number, number]

}

/******************** ROOM PLANNING *********************/
interface structureData{
    id: string;
    pos: [number, number];
}