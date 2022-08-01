export function getPlanningStructurePos(roomName: string ,structureType: string, index: number) {
    const pos: [number, number] = Memory['colony'][roomName]['roomPlanning']['model'][structureType][index]['pos'];
    return pos;
}

export function getPlanningStructureId(roomName: string ,structureType: string, index: number) {
    const pos: [number, number] = Memory['colony'][roomName]['roomPlanning']['model'][structureType][index]['id'];
    if (pos) return pos;
    return null;
}



