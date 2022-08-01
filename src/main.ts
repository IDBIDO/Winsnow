import {Colony} from "./colony/Colony"
import * as ColonyApi from "./colony/ColonyApi"
import {Mem} from "./colony/Memory"

import mountCreep from './creep'
import { CreepSpawning } from "./structure/CreepSpawning"
/*
ColonyApi.createColony('W7N3')



*/


//Main loop
module.exports.loop = function() {
  
  mountCreep();
  Mem;
  

  ColonyApi;

  //const colony = new Colony('W6N8');
  //colony.run();

  const creepSpawning = new CreepSpawning('W8N7');
  //console.log(creepSpawning.uid());
    //console.log(performance.now());
    //console.log('C' + Math.random().toString(36).substr(2,8));
    

}
