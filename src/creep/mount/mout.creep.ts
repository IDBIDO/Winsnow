
import roles from '../role'

/*
    creep work 
*/

export default class CreepExtension extends Creep {
    //public work(data: SourceTargetData, role: string): void
    public work(): void {
        //let data: SourceTargetData = {"target": "aaa", "source": "ddd"};
        //const config: ICreepConfig = worker['builder'](s);
        let role = '';
        //---------------- GET CREEP LOGIC --------------------
        //console.log(this.memory['role']);
        //console.log(this.memory['data'])

        const creepLogic = roles[this.memory['role']](this.memory['task'])  ////////////////////////
        //const creepLogic = roles[role](data);


        // ------------------------ 第二步：执行 creep 准备阶段 ------------------------

        // 没准备的时候就执行准备阶段
        if (!this.memory['ready']) {
            // 有准备阶段配置则执行
            if (creepLogic.prepare && creepLogic.isReady) {
                creepLogic.prepare(this)
                this.memory['ready'] = creepLogic.isReady(this)
            }
            // 没有就直接准备完成
            else this.memory['ready'] = true
            return
        }

        // ------------------------ 第三步：执行 creep 工作阶段 ------------------------

        let stateChange = true
        // 执行对应阶段
        // 阶段执行结果返回 true 就说明需要更换 working 状态
        if (this.memory['working']) {
            if (creepLogic.target) stateChange = creepLogic.target(this)
        }
        else {
            if (creepLogic.source) stateChange = creepLogic.source(this)
        }

        // 状态变化了就切换工作阶段
        if (stateChange) this.memory['working'] = !this.memory['working']
        }
    }