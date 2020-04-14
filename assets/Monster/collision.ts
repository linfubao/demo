import GD from "../utils/global"
const { ccclass, property } = cc._decorator;

@ccclass
export default class Star extends cc.Component {
    starPool:cc.NodePool = null;
    scoreNode:cc.RichText = null;
    scoreNum:number = 0;

    onLoad() {
        cc.director.on('setStarData',function(pool:cc.NodePool,scoreNode:cc.RichText){
            this.starPool = pool;
            this.scoreNode = scoreNode;            
        },this);//这里注意this指向问题
    }
    // 只在两个碰撞体开始接触时被调用一次
    onCollisionEnter(self,other) {
        // console.log("self",self, "other",other);
        GD.monsterCollider = true;
        other.node.stopAllActions();
        this.starPool.put(other.node);
        this.updateScore();
        cc.find('Canvas').getComponent("main").creatStar();
    }
    updateScore(){
        this.scoreNum += 1;
        this.scoreNode.getComponent(cc.RichText).string = `<color=#00ff00>得分: </c><color=#FDFD00>${this.scoreNum}</color>`;
        cc.sys.localStorage.setItem("MonsterGame",JSON.stringify({score:this.scoreNum}));
    }

    // update (dt) {}
}
