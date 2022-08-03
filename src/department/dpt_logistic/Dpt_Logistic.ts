import { Department } from "../Department";
import * as dpt_config from "@/department/dpt_config"


export default class Dpt_Logistic extends Department {

    constructor(dptRoom: string) {
        super(dptRoom, 'dpt_logistic');
    }

    protected actualizeCreepNumber() {
        throw new Error("Method not implemented.");
    } 

    public run() {
        
    }

}