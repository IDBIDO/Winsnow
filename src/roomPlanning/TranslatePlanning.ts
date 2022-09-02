import * as planning from "./RoomPlanning"
import * as utils from "./planningUtils"
import * as acces from "./planningAcces"
import { connectedComponents } from "@/utils";

export class TranslatePlanning {
    mainRoom: string;


    constructor(mainRoom: string) {
        this.mainRoom = mainRoom;
    }

    public savePlanningModel() {
        let roomStructsData;

        let p =  Game.flags.p;
        let pc =  Game.flags.pc;
        let pm =  Game.flags.pm;
        let pa =  Game.flags.pa;
        let pb =  Game.flags.pb;

        const saPosition: [number, number] = [pa.pos.x, pa.pos.y];
        const sbPosition: [number, number] = [pb.pos.x, pb.pos.y];
        const cPosition: [number, number] = [pc.pos.x, pc.pos.y];
        const mPosition: [number, number] = [pm.pos.x, pm.pos.y];
        

        if (p) {
            roomStructsData = planning.ManagerPlanner.computeManor(this.mainRoom,[pc,pm,pa,pb])
            Game.flags.p.remove();
        }
        if (roomStructsData) {
            planning.HelperVisual.showRoomStructures(this.mainRoom,roomStructsData['structMap'])
            
            Memory['colony'][this.mainRoom]['roomPlanning'] = {};
            //save model
            this.generateModel(roomStructsData['structMap']);
  
            this.generateTemporal();
            /*
                {
                    'road'{
                        9: [x, y],
                        8: [x, y]
                    },
                    'extension' {
                        
                    }
                }
            */
            this.constructionSideRefAndPos();
            this.inRampartPos();
            this.containerReference(roomStructsData['structMap']['container']);
            this.linkReference(roomStructsData['structMap']['link']);
            this.roadReference(roomStructsData['structMap']['road']);
            this.labReference(roomStructsData['structMap']['lab']);

            return true;
        }
        return false;
    }

    private constructionSideRefAndPos() {
        Memory['colony'][this.mainRoom]['roomPlanning']['constructionSide'] = {};

        const constructionSideRefPos = Memory['colony'][this.mainRoom]['roomPlanning']['constructionSide'];
        const model = Memory['colony'][this.mainRoom]['roomPlanning']['model'];
        for (let structureType in model) {
            constructionSideRefPos[structureType] = {};
        }
    }

    private labReference(labList:[]){
        
    }

    private roadReference(roadList:[]) {
        let roadListAdj =  utils.transformRoadToAdjacentList( roadList);
        const spawn0Pos: [number, number] = Memory['colony'][this.mainRoom]['roomPlanning']['model']['spawn'][0]['pos'];
        const posRoadNearSpawn0 = utils.nearPointOne(spawn0Pos, roadList);
                
        //Spawn0 to source1 path
        const containerSource1Reference: number = Memory['colony'][this.mainRoom]['roomPlanning']['containerReference']['container_source1']
        const containerSource1Pos: [number, number] = Memory['colony'][this.mainRoom]['roomPlanning']['model']['container'][containerSource1Reference]['pos'];
        const posRoadNearContainerSource1 = utils.nearPointOne(containerSource1Pos, roadList);
        let spawn0ToSource1 = utils.roadPath(roadListAdj, posRoadNearSpawn0, posRoadNearContainerSource1);
     
        //Spawn0 to source2 path
        const containerSource2Reference: number = Memory['colony'][this.mainRoom]['roomPlanning']['containerReference']['container_source2']
        const containerSource2Pos: [number, number] = Memory['colony'][this.mainRoom]['roomPlanning']['model']['container'][containerSource2Reference]['pos'];
        const posRoadNearContainerSource2 = utils.nearPointOne(containerSource2Pos, roadList);
        let spawn0ToSource2 = utils.roadPath(roadListAdj, posRoadNearSpawn0, posRoadNearContainerSource2);

        //Spawn0 to controller
        const containerControllerReference: number = Memory['colony'][this.mainRoom]['roomPlanning']['containerReference']['container_controller']
        const containerControllerPos: [number, number] = Memory['colony'][this.mainRoom]['roomPlanning']['model']['container'][containerControllerReference]['pos'];
        const posRoadNearContainerController = utils.nearPointOne(containerControllerPos, roadList);
        let spawn0ToController = utils.roadPath(roadListAdj, posRoadNearSpawn0, posRoadNearContainerController);

        
        //Spawn0 to mineral
        const containerMineralReference: number = Memory['colony'][this.mainRoom]['roomPlanning']['containerReference']['container_mineral']
        const containerMineralPos: [number, number] = Memory['colony'][this.mainRoom]['roomPlanning']['model']['container'][containerMineralReference]['pos'];
        const posRoadNearContainerMineral = utils.nearPointOne(containerMineralPos, roadList);
        let spawn0ToMineral = utils.roadPath(roadListAdj, posRoadNearSpawn0, posRoadNearContainerMineral);


        Memory['colony'][this.mainRoom]['roomPlanning']['roadReference'] = {
            'spawn0ToSource1': spawn0ToSource1,
            'spawn0ToSource2': spawn0ToSource2,
            'spawn0ToController': spawn0ToController,
            'spawn0ToMineral': spawn0ToMineral
        }

    }

    private roomWall(): boolean[][] {
        const rampartList = Memory['colony'][this.mainRoom]['roomPlanning']['temp']['rampart'];
        const matrix = new Array(50).fill(true).map(() => new Array(50).fill(true));
        const terrain = new Room.Terrain(this.mainRoom);
        for (let i = 0; i < 50; ++i) {
            for (let j = 0; j < 50; ++j) {
                if (terrain.get(i, j) == TERRAIN_MASK_WALL || utils.isRampartPos(this.mainRoom,[i, j])) {
                    matrix[i][j] = false;
                }
            }
        }
        return matrix;
    }

    private nearConectedPos(pos: [number, number]): [number, number][] {
        const terrain = new Room.Terrain(this.mainRoom);
        const rampartList = Memory['colony'][this.mainRoom]['roomPlanning']['temp']['rampart'];

        const candidatePos = utils.nearPosition(pos);
        
        let r: [number, number][] = [];
        for (let i = 0; i < candidatePos.length; ++i) {

            if (terrain.get(candidatePos[i][0], candidatePos[i][1]) != TERRAIN_MASK_WALL && !utils.isRampartPos(this.mainRoom, candidatePos[i])) {
                r.push([candidatePos[i][0], candidatePos[i][1]])
            }
        }

        return r;
    }

    private roomWallToAdj(roomCanPass: boolean[][]): number[][] {
        let adjList: number[][]= [];
        for (let i = 0; i < roomCanPass.length; ++i) {
            for (let j = 0; j < roomCanPass[i].length; ++j) {
                const node = utils.translatePosToNode([i, j]);
                //console.log(node);
                
                if (!roomCanPass[i][j]) {
                    adjList[node]=[];
                } 
                else {
                    const nearPos = this.nearConectedPos([i, j]);
                    let actualNode: number[] = [];
                    for (let i = 0; i < nearPos.length; ++i) {
                       actualNode.push( utils.translatePosToNode(nearPos[i]) )
                    }
                    adjList[node] = actualNode;

                }
            }
        }

        
        
       /*
        for (let i = 0; i < roomCanPass.length; ++i) {
            for (let j = 0; j < roomCanPass[i].length; ++j) {
                const node = this.translatePosToNode([j, i]);
                //console.log(node);
                if (!roomCanPass[i][j]) adjList.push([]);
                else {
                    const nearPos = this.nearConectedPos([j, i]);
                    let actualNode: number[] = [];
                    for (let i = 0; i < nearPos.length; ++i) {
                        actualNode.push( this.translatePosToNode(nearPos[i]) )
                    }
                    adjList.push(actualNode);
                }

            }
        }
        */
        return adjList;
    }

    private translatePosToNode(pos: [number, number]): number {
        return pos[0]*50 + pos[1];
    }

    private translateNodeToPos(node: number): [number, number] {
        return [Math.floor(node/50), node%50]
    }

    private searchCC(cc: number[][], obj: number) {
        for (let i = 0; i< cc.length; ++i) {
            
            for (let j = 0; j < cc[i].length; ++j) {
                if (cc[i][j] == obj) {
                    return i;
                }
            }
        }
        return -1;
    }

    private inRampartPos() {

        //const matrix = new Array(50).fill(false).map(() => new Array(50).fill(false));

        //wall pos mask false
        const roomWall = this.roomWall();
        let cont = 0;
        
        for (let i = 0; i < roomWall.length; ++i) {
            for (let j = 0; j < roomWall.length; ++j) {
                if (!roomWall[i][j]) ++cont;
            }
        }
        
        const adjacentList = this.roomWallToAdj(roomWall);
        const cc = connectedComponents(adjacentList)
        
        const spawn0Pos = Memory['colony'][this.mainRoom]['roomPlanning']['model']['spawn'][0]['pos'];
        const spawn0Node = utils.translatePosToNode(spawn0Pos);
        const indexProtectedComponent = this.searchCC(cc, spawn0Node);
        
        console.log(cc[indexProtectedComponent]);
        let sortedCC = cc[indexProtectedComponent];
        sortedCC.sort();
        console.log(sortedCC);

        let protectedPos: [number, number][] = [];
        for (let i = 0; i < sortedCC.length; ++i) {
            protectedPos.push(utils.translateNodeToPos(sortedCC[i]));
        }
        console.log(protectedPos);
        Memory['colony'][this.mainRoom]['roomPlanning']['inRampartPos'] = sortedCC;
        
    }

    private linkReference(linkList: []){
        const containerReference = Memory['colony'][this.mainRoom]['roomPlanning']['containerReference'];

        let posSourceContainer1: [number, number] = acces.getPlanningStructurePos(this.mainRoom, 'container', containerReference['container_source1']);
        let posSourceContainer2: [number, number] = acces.getPlanningStructurePos(this.mainRoom, 'container', containerReference['container_source2']);
        let posControllerContainer: [number, number] = acces.getPlanningStructurePos(this.mainRoom, 'container', containerReference['container_controller']);
        let posCenterContainer: [number, number] = acces.getPlanningStructurePos(this.mainRoom, 'container', containerReference['container_mineral']);

        let linkSourcel = utils.minDistance(posSourceContainer1, linkList);
        let linkSource2 = utils.minDistance(posSourceContainer2, linkList);
        let linkController = utils.minDistance(posControllerContainer, linkList);   
        let linkCenter: number;
        for (let i = 0; i < linkList.length; ++i) {
            if (i != linkSourcel && i != linkSource2 && i != linkController) {
                linkCenter = i;
            }
        }

        Memory['colony'][this.mainRoom]['roomPlanning']['linkReference'] = {
            'link_source1': linkSourcel,
            'link_source2': linkSource2,
            'link_controller': linkController,
            'link_center': linkCenter
        }
        
    }

    private containerReference(containerList: []) {

        let posSource1:[number, number] = Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'][0]['pos'];
        let posSource2:[number, number] = Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'][1]['pos'];
        let posMineral:[number, number] = Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'][2]['pos'];

        let aux = Game.rooms[this.mainRoom].controller;
        let posController: [number, number] = [aux.pos.x, aux.pos.y];

        let containerSourcel = utils.minDistance(posSource1, containerList);
        let containerSource2 = utils.minDistance(posSource2, containerList);
        let containerMineral = utils.minDistance(posMineral, containerList);
        let containerController = utils.minDistance(posController, containerList);        


        Memory['colony'][this.mainRoom]['roomPlanning']['containerReference'] = {
            'container_source1': containerSourcel,
            'container_source2': containerSource2,
            'container_mineral': containerMineral,
            'container_controller': containerController
        }
    }

    /*
        Planning model data. 
    */
    private generateModel(model: {}): void {
        Memory['colony'][this.mainRoom]['roomPlanning']['model'] = {}
        for (let structureName in model) {
            Memory['colony'][this.mainRoom]['roomPlanning']['model'][structureName] = []
            for (let i in model[structureName])
                Memory['colony'][this.mainRoom]['roomPlanning']['model'][structureName].push(
                    {'id': '', 'pos': model[structureName][i]}
                )
        }

        const saPos: [number, number] = [Game.flags.pa.pos.x, Game.flags.pa.pos.y];
        const sbPos: [number, number] = [Game.flags.pb.pos.x, Game.flags.pb.pos.y];
        const mPos: [number, number] = [Game.flags.pm.pos.x, Game.flags.pm.pos.y];
        Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'] = [];
        Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'].push(
            {'id': utils.getId(this.mainRoom, saPos, 'source'), 'pos': saPos}
        )
        Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'].push(
            {'id': utils.getId(this.mainRoom, sbPos, 'source'), 'pos': sbPos}
        )
        Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'].push(
            {'id': utils.getId(this.mainRoom, mPos, 'mineral'), 'pos': mPos}
        )
    }

    private tempExtension() {
        const temp = Memory['colony'][this.mainRoom]['roomPlanning']['temp'];
        const extensionList = Memory['colony'][this.mainRoom]['roomPlanning']['model']['extension'];
        temp['extension'] = {};

        const spawn0Pos:[number, number] = Memory['colony'][this.mainRoom]['roomPlanning']['model']['spawn'][0]['pos'];
        let array = Array<arrayPos>(extensionList.length);
        for (let i = 0; i < extensionList.length; ++i) {
            //temp['extension'][i] = extensionList[i]['pos'];
            const distance = utils.distanceTwoPoints(spawn0Pos, extensionList[i]['pos']);
            const temp: arrayPos = {
                'ref': i.toString(),
                'pos': extensionList[i]['pos'],
                'distance': distance
            }
            array[i] = temp;
        }
        array.sort(function (a, b) {

            if (a.distance > b.distance) {  //si a es mayor, retornar 1
            return 1;
            }
            if (a.distance < b.distance) {  //si a es memor, retornar -1
            return -1;
            }
            // a must be equal to b
            return 0;
            
        });

        for (let i = 0; i < extensionList.length; ++i) {
            temp['extension'][i] = array[i].pos;

        }

        //change model extension
        const modelExtension = Memory['colony'][this.mainRoom]['roomPlanning']['model']['extension'];
        for (let i = 0; i < modelExtension.length; ++i) {
            modelExtension[i]['pos'] = temp['extension'][i];
        }
    }

    private tempSpawn() {
        const temp = Memory['colony'][this.mainRoom]['roomPlanning']['temp'];
        const spawnList = Memory['colony'][this.mainRoom]['roomPlanning']['model']['spawn'];
        temp['spawn'] = {};

        const controllerRoomPos = Game.rooms[this.mainRoom].controller.pos;
        const controllerPos:[number, number] = [controllerRoomPos.x, controllerRoomPos.y];
        let array = Array<arrayPos>(spawnList.length);
        for (let i = 0; i < spawnList.length; ++i) {
            //temp['extension'][i] = extensionList[i]['pos'];
            const distance = utils.distanceTwoPoints(controllerPos, spawnList[i]['pos']);
            const temp: arrayPos = {
                'ref': i.toString(),
                'pos': spawnList[i]['pos'],
                'distance': distance
            }
            array[i] = temp;
        }
        array.sort(function (a, b) {

            if (a.distance < b.distance) {  //si a es mayor, retornar 1
            return 1;
            }
            if (a.distance > b.distance) {  //si a es memor, retornar -1
            return -1;
            }
            // a must be equal to b
            return 0;
            
        });

        for (let i = 0; i < spawnList.length; ++i) {
            temp['spawn'][i] = array[i].pos;

        }

        //change model extension
        const modelExtension = Memory['colony'][this.mainRoom]['roomPlanning']['model']['spawn'];
        for (let i = 0; i < modelExtension.length; ++i) {
            modelExtension[i]['pos'] = temp['spawn'][i];
        }

        
    }

    private generateTemporal() {
        Memory['colony'][this.mainRoom]['roomPlanning']['temp'] = {};
        const temp = Memory['colony'][this.mainRoom]['roomPlanning']['temp'];
        const model = Memory['colony'][this.mainRoom]['roomPlanning']['model'];

        //copy model to temp
        for (let structureName in model) {
            Memory['colony'][this.mainRoom]['roomPlanning']['temp'][structureName] = {}
            for (let i in model[structureName])
                Memory['colony'][this.mainRoom]['roomPlanning']['temp'][structureName][i] =
                    model[structureName][i]['pos']
                
        }

        //modify spawn order
        this.tempSpawn();

        //modify extension order
        this.tempExtension();

        

    }

}