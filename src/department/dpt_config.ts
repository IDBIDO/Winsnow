//Creep Controller

export const energyAvailable = [300, 550, 800, 1300, 1800, 2300, 5600, 10000]

export function getEnergyRCL(energyAmount: number): number {

    let found = false;
    let i = 0;
    while( !found && i < 8) {
        if (energyAmount <= energyAvailable[i]) return i+1;
        ++i;
    }
    return -1;
}

//Restriccion: pos no puede estar en el borde del mapa!!!
export function positionToStand(roomName: string, pos: [number, number]): [number, number][] {
    const terrain = new Room.Terrain(roomName);
    
    let canStand:[number, number][];
    if (terrain.get(pos[0]-1, pos[1]+1) != 1) canStand.push([pos[0]-1, pos[1]+1]);
    if (terrain.get(pos[0]-1, pos[1]) != 1) canStand.push([pos[0]-1, pos[1]]);
    if (terrain.get(pos[0]-1, pos[1]-1) != 1) canStand.push([pos[0]-1, pos[1]-1]);

    if (terrain.get(pos[0], pos[1]+1) != 1) canStand.push([pos[0], pos[1]+1]);
    if (terrain.get(pos[0], pos[1]) != 1) canStand.push([pos[0], pos[1]]);
    if (terrain.get(pos[0], pos[1]-1) != 1) canStand.push([pos[0]-1, pos[1]+1]);

    if (terrain.get(pos[0]+1, pos[1]+1) != 1) canStand.push([pos[0]+1, pos[1]+1]);
    if (terrain.get(pos[0]-1, pos[1]) != 1) canStand.push([pos[0]-1, pos[1]]);
    if (terrain.get(pos[0]-1, pos[1]-1) != 1) canStand.push([pos[0]-1, pos[1]-1]);




    return canStand
}

export function nwork(energyAmount: number): {} {
    let energyRCL = getEnergyRCL(energyAmount);
    if (energyRCL == 1) {

    }

    return
}


export const permmanentCreepsRoleNum = {
    dpt_work: {
        role: 'worker',
        numConfig: [2, 2, 2, 2, 2, 2, 2, 2]
    }
}

export const permanentNumConfigs = {
    dpt_work: [2, 2, 2, 2, 2, 2, 2, 2],
    dpt_harvester:[2, 2, 2, 2, 2, 2, 2, 2]
    

}

