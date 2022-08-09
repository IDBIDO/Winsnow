
export function getLinkReference(roomName: string, structureFunction: LinkFunction):number {
    return Memory['colony'][roomName]['roomPlanning']['linkReference'][structureFunction];
}

export function getContainerReference(roomName: string, structureFunction: ContainerFunction):number {
    return Memory['colony'][roomName]['roomPlanning']['containerReference'][structureFunction];
}

export function getContainerPos(roomName: string, containerFunction: ContainerFunction) {
    const sc1Reference = getContainerReference(roomName, containerFunction);
    const sc1Pos: [number, number] = Memory['colony'][roomName]['roomPlanning']['model']['container'][sc1Reference]['pos'];
    return sc1Pos;
}

export function getConstructionSideID(roomName:string, pos: [number, number]) {
    const targetPos = new RoomPosition(pos[0], pos[1], roomName);
    const constructionSideList = targetPos.lookFor(LOOK_CONSTRUCTION_SITES);
    console.log(constructionSideList);
    
    if (constructionSideList) {
        //console.log(constructionSideList[0]['id']);
        
        return constructionSideList[0]['id'];
    }
    else return null;
}

export function getSourceEnery1ID(roomName: string) {
    return Memory['colony'][roomName]['roomPlanning']['model']['source'][0]['id'];
}

export function getSourceEnery2ID(roomName: string) {
    return Memory['colony'][roomName]['roomPlanning']['model']['source'][1]['id'];
}







/******************** COMPU POSITION **********************/


//Restriccion: pos no puede estar en el borde del mapa!!!
export function positionToHarvest(roomName: string, pos: [number, number]): [number, number][] {
    const terrain = new Room.Terrain(roomName);
    
    let canStand:[number, number][] = [];
    if (terrain.get(pos[0]-1, pos[1]+1) != 1) canStand.push([pos[0]-1, pos[1]+1]);  //x-1, y+1
    if (terrain.get(pos[0]-1, pos[1]) != 1) canStand.push([pos[0]-1, pos[1]]);      //x-1, y
    if (terrain.get(pos[0]-1, pos[1]-1) != 1) canStand.push([pos[0]-1, pos[1]-1]);  //x-1, y-1

    if (terrain.get(pos[0], pos[1]+1) != 1) canStand.push([pos[0], pos[1]+1]);      //x, y+1
    if (terrain.get(pos[0], pos[1]) != 1) canStand.push([pos[0], pos[1]]);          //x, y
    if (terrain.get(pos[0], pos[1]-1) != 1) canStand.push([pos[0]-1, pos[1]+1]);    //x, y-1

    if (terrain.get(pos[0]+1, pos[1]+1) != 1) canStand.push([pos[0]+1, pos[1]+1]);  //x+1, y+1
    if (terrain.get(pos[0]+1, pos[1]) != 1) canStand.push([pos[0]+1, pos[1]]);      //x-1, y
    if (terrain.get(pos[0]+1, pos[1]-1) != 1) canStand.push([pos[0]+1, pos[1]-1]);  //x-1, y-1

    return canStand
}

/************************ SEND TO SPAWN ************************/
