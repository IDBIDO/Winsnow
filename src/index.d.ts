
/********************* ROLE DATA ****************/

interface HarvesterData{
    source: string;
    target: string;
}

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
    'MOVE' | 'TRANSFER' | 'WITHDRAW'

type LogisticTaskRequest = 
    MoveRequest | TransferRequest | WithdrawRequest

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

interface WithdrawRequestData {
    id: string, 
    resourceType: ResourceConstant
}

interface WithdrawRequest {
    type: 'WITHDRAW',
    source: WithdrawRequestData
}

interface transferTaskOperation {
         // creep 工作时执行的方法
    target: (creep: Creep) => boolean
    // creep 非工作(收集资源时)执行的方法
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
    // 每次死后都会进行判断，只有返回 true 时才会重新发布孵化任务
    isNeed?: (room: Room, creepName: string, preMemory: CreepMemory) => boolean;
    // 准备阶段执行的方法, 返回 true 时代表准备完成
    prepare?: (creep: Creep) => boolean;
    // creep 获取工作所需资源时执行的方法
    // 返回 true 则执行 target 阶段，返回其他将继续执行该方法
    */
    source?: (creep: Creep) => boolean;
    // creep 工作时执行的方法,
    // 返回 true 则执行 source 阶段，返回其他将继续执行该方法
    target: (creep: Creep) => boolean;

    // 每个角色默认的身体组成部分
    //bodys: BodyPartConstant[];
}

type BaseRoleConstant = 
    'harvester' |
    'colonizer' |
    //'collector' |
    //'miner' |
    //'upgrader' |
    //'filler' |
    'builder' 
    //'repairer'
    
type AdvancedRoleConstant =
    'manager'|
    'transporter'
    
type CreepWork = {
    [role in CreepRoleConstant]: (data: {}) => ICreepConfig
}

// 所有的 creep 角色
type CreepRoleConstant = BaseRoleConstant | AdvancedRoleConstant 


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

