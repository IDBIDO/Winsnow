
export function getLinkReference(roomName: string, structureFunction: LinkFunction):number {
    return Memory['colony'][roomName]['roomPlanning']['linkReference'][structureFunction];
}

export function getContainerReference(roomName: string, structureFunction: ContainerFunction):number {
    return Memory['colony'][roomName]['roomPlanning']['containerReference'][structureFunction];
}

export function getContainerPos(roomName: string, containerFunction: ContainerFunction) {
    const sc1Reference = getContainerReference(roomName, containerFunction);
    const sc1Pos: [number, number] = Memory['colony'][roomName]['roomPlannig']['model']['container'][sc1Reference]['pos'];
    return sc1Pos;
}

export function getConstructionSideID(roomName:string, pos: [number, number]) {
    const targetPos = new RoomPosition(pos[0], pos[1], roomName);
    const constructionSideList = targetPos.lookFor(LOOK_CONSTRUCTION_SITES);
    if (constructionSideList) {
        return constructionSideList[0].id;
    } 
    else return null;
}


