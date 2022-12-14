//Creep Controller



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




export const permmanentCreepsRoleNum = {
    dpt_build: {
        role: 'worker',
        numConfig: [2, 2, 2, 2, 2, 2, 2, 2]
    }
}

export const permanentNumConfigs = {
    dpt_build: [2, 2, 2, 2, 2, 2, 2, 2],
    dpt_harvest:[2, 2, 2, 2, 2, 2, 2, 2]
    

}




