

export function saveStructureID(roomName:string, structureType: string, index: number, id: string):void {
    Memory['colony'][roomName]['roomPlanning']['model'][structureType][index]['id'] = id;
}

/** CONTAINER CONSULTOR */
export function getContainerIndex(roomName: string, structureFunction: ContainerFunction):number {
    return Memory['colony'][roomName]['roomPlanning']['containerReference'][structureFunction];
}

export function getRangePoints(pos: [number, number], range: number) {
    
}