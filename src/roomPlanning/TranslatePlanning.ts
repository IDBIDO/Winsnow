import * as planning from "./RoomPlanning"
import * as utils from "./planningUtils"
import * as acces from "./planningAcces"

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
            this.containerReference(roomStructsData['structMap']['container']);
            this.linkReference(roomStructsData['structMap']['link']);
            this.roadReference(roomStructsData['structMap']['road']);
            this.labReference(roomStructsData['structMap']['lab']);
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
            if (a.distance > b.distance) {
              return 1;
            }
            if (a.distance < b.distance) {
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

    private generateTemporal() {
        Memory['colony'][this.mainRoom]['roomPlanning']['temp'] = {};
        const temp = Memory['colony'][this.mainRoom]['roomPlanning']['temp'];
        const model = Memory['colony'][this.mainRoom]['roomPlanning']['model'];

        //copy model to temp
        for (let structureName in model) {
            Memory['colony'][this.mainRoom]['roomPlanning']['temp'][structureName] = {}
            for (let i in model[structureName])
                Memory['colony'][this.mainRoom]['roomPlanning']['temp'][structureName][i] =
                    model[structureName][i]
                
        }

        /*
        const roadList = Memory['colony'][this.mainRoom]['roomPlanning']['model']['road'];
        temp['road'] = {};
        for (let i = 0; i < roadList.length; ++i) {
            temp['road'][i] = roadList[i]['pos'];
        }
        */
        
        //modify extension order
        this.tempExtension();
        

    }

}