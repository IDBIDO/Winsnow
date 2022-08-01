import { max, xor } from "lodash";

export function equalPoint(pointA: [number, number], pointB: [number, number]): boolean {
    if (pointA[0] == pointB[0] && pointA[1] == pointB[1]) return true;
    return false;
}

export function maxTwoNumber(x:number, y: number) {
    if (x >= y) return x;
    return y;
}

export function distanceTwoPoints(pointA: [x: number, y:number], pointB: [x: number, y:number]): number {

    //return Math.sqrt( (pointA[0]-pointB[0]) **2 + (pointA[1]-pointB[1]) **2 )
    let x = Math.sqrt( (pointA[0]-pointB[0]) **2);
    //console.log(x);
    
    let y = Math.sqrt( (pointA[1]-pointB[1]) **2);
    //console.log(y);
    
    return maxTwoNumber(x, y);


}

/*
    punto de distancia minima del listPoint un punto 'point' dado
*/

export function minDistance(point: [x: number, y: number], listPoint: [x: number, y: number][]): number {
    let pmim = listPoint[0];
    let disMin = distanceTwoPoints(point, listPoint[0]);
    let index = 0;
    
    for (let i = 1; i < listPoint.length; ++i) {
        let aux = distanceTwoPoints(point, listPoint[i]);
        if (aux < disMin) {
            disMin = aux;
            pmim = listPoint[i];
            index = i;
        }
    }
    //listPoint.splice(index, 1);
    
    return index;
    //return [pmim[0], pmim[1]];
}



export function transformToPoint(structurePos: number[]): Point {
    
    let point: Point = { "x": structurePos[0], "y":structurePos[1] };

    return point;
}

export function transformToPointList(model:{}) {
    let toPoint = {};
    for (let structureName in model) {        
        toPoint[structureName] = [];
        for (let i = 0; i < model[structureName].length; ++i) {
            toPoint[structureName].push( transformToPoint(model[structureName][i]) );
            console.log(toPoint[structureName][i].x);
            
        }
        
    }

    return toPoint;
}



/*
    puntos de distancia 1 de un punto dado a una lista de puntos
*/
export function nearPoint(point: [x: number, y: number], listPoint: [x: number, y: number][]): number[] {
    
    let near: number[] = [];
    for (let i = 0; i < listPoint.length; ++i) {
        if (distanceTwoPoints(point, listPoint[i]) == 1) {
            near.push(i);
        }
    }
    return near;
}

export function nearPointOne(point: [x: number, y: number], listPoint: [x: number, y: number][]): number {
    
    let near: number;
    for (let i = 0; i < listPoint.length; ++i) {
        if (distanceTwoPoints(point, listPoint[i]) == 1) {
            near = i;
            break;
        }
    }
    return near;
}

export function transformRoadToAdjacentList(roadList: [x: number, y: number][]): number[][] {
    let adjacentList: number[][] = [];
    for (let i = 0; i < roadList.length; ++i) {
        adjacentList.push(nearPoint(roadList[i], roadList));
        console.log(i , nearPoint(roadList[i], roadList));
        
    }
    console.log(adjacentList);
    
    return adjacentList;
}

export function reconstructPath(beginPoint: number, endPoint: number, prev: number[]): number[] {
    let path:number[] = [];
    for (let at = endPoint; at != -1; at = prev[at]) {
        path.push(at)
    }
    path.reverse();

    if (path[0] == beginPoint) {
        return path;
    }

    return [];

}

export function solveBFS(roadList: number[][], beginPoint: number): number[] {

    //initialize visited array
    let visited: boolean[] = Array<boolean>();
    for (let i = 0; i < roadList.length; ++i) {
        visited.push(false);
    }

    // Use an array as our queue representation:
    let q: number[] = new Array<number>();

    visited[beginPoint] = true;

    q.push(beginPoint);

    //save path
    let path: number[] = new Array<number>();
    path.push(beginPoint);

    let prev = new Array<number>();
    for (let i = 0; i < roadList.length; ++i) {
        prev.push(-1);
    }

    while(q.length > 0) {

        const v = q.shift();
        for (let adjV of roadList[v]) {
            if (!visited[adjV]) {
                visited[adjV] = true;
                q.push(adjV);
                prev[adjV] = v;
            }
        }
    }
    return prev;
}

export function roadPath(roadList: number[][], beginPoint: number, endPoint: number) {
    let prev = solveBFS(roadList, beginPoint);

    return reconstructPath(beginPoint, endPoint, prev);
}

//get object's ID by roomName, position and structure type
export function getId(roomName: string, pos: [number, number], structureType: string) {

    console.log(structureType);
    
    const position = new RoomPosition(pos[0], pos[1], roomName);
    const object = position.lookFor(structureType as keyof AllLookAtTypes);
    
    return object[0].id;
}

