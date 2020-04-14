const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    scoreNode:cc.Node = null;
    bird:cc.Node = null;
    bird_x:number = 0;
    bird_w:number = 0;
    num:number = 0;
    flag:boolean = false;
    sche:cc.Scheduler = null;
    onLoad () {
        this.scoreNode = cc.find('Canvas/labBox/score');
        this.bird = cc.find('Canvas/bird');
        this.bird_x = this.bird.getBoundingBoxToWorld().x;
        this.bird_w = this.bird.getBoundingBoxToWorld().width;
    }
    update (dt) {
        if(this.flag === true) return;
        if(this.node.getBoundingBoxToWorld().x < (this.bird_x-this.bird_w)){
            this.num = Number(this.scoreNode.getComponent(cc.Label).string);
            this.num += 1;
            this.scoreNode.getComponent(cc.Label).string = String(this.num);
            let data:object = {score:this.num};
            cc.sys.localStorage.setItem("score",JSON.stringify(data));
            this.flag = true;
        }
    }
}
