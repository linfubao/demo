import Utils from "../utils/utils";
import GD from "../utils/global";
const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    left: cc.Node = null;
    @property(cc.Node)
    right: cc.Node = null;
    @property(cc.Node)
    ball: cc.Node = null;
    @property(cc.Node)
    playState: cc.Node = null;
    @property(cc.Prefab)
    starPrefab: cc.Prefab = null;
    @property(cc.Toggle)
    debug: cc.Toggle = null;
    @property(cc.RichText)
    scoreNode: cc.RichText = null;
    @property(cc.Label)
    warnLab: cc.Label = null;

    move_h: number = 150;
    speed: number = 0;
    speed_max: number = 400;
    leftFlag: boolean = null;
    rightFlag: boolean = null;
    starPool: cc.NodePool = null;
    startGame:boolean = null;
    onLoad() {
        cc.director.getCollisionManager().enabled = true;
        this.pools();
        this.updateState("开始游戏");
        this.touchEvent();
        this.ball.runAction(
            cc.sequence(
                cc.moveBy(0.25, 0, this.move_h).easing(cc.easeCubicActionOut()),
                cc.moveBy(0.25, 0, -this.move_h).easing(cc.easeCubicActionIn())
            ).repeatForever()
        );
        
    }
    pools() {
        this.starPool = new cc.NodePool();
        for (let i = 0; i < 10; i++) {
            let node = cc.instantiate(this.starPrefab);
            this.starPool.put(node);
        }
    }
    randomPosition(star: cc.Node) {
        let width = this.node.width;
        let delta = 300;
        let x_min: number = -width / 2 + delta;
        let x_max: number = width / 2 - delta;
        let y_min: number = this.ball.height;
        let y_max: number = this.move_h + star.height / 2;
        let x: number = Math.random() * (x_max - x_min) + x_min;
        let y: number = Math.random() * (y_max - y_min) + y_min;
        return { x: x, y: y };
    }
    creatStar() {
        this.startGame = true;
        GD.monsterCollider = false;
        let star: cc.Node = this.starPool.size() > 0 ? this.starPool.get() : cc.instantiate(this.starPrefab);
        this.node.addChild(star);
        cc.director.emit("setStarData", this.starPool, this.scoreNode);
        let ps = this.randomPosition(star);
        // console.log("随机位置", x, y);
        star.setPosition(ps.x, ps.y);
        star.runAction(
            cc.sequence(
                cc.delayTime(0.2),
                cc.fadeIn(0.1),
                cc.delayTime(1),
                cc.fadeOut(0.5),
                cc.callFunc(() => {
                    // console.log("GD.monsterCollider",GD.monsterCollider);
                    if (!GD.monsterCollider) {
                        console.log("游戏结束");
                        cc.director.loadScene("Monster");
                    }
                }),
            ).repeatForever()
        );
    }
    touchEvent() {
        this.left.emit("touchstart");
        this.left.on("touchstart", this._leftStart, this);
        this.right.on("touchstart", this._rightStart, this);
        this.playState.on("touchstart", this._playState, this);
    }
    _playState(e) {
        this.creatStar();
        this.updateState("进行中...");
    }
    updateState(state: string) {
        let node = this.playState.getChildByName("state");
        node.getComponent(cc.Label).string = state;
    }
    _leftStart(e) {
        if(this.warnWord())return;
        this.leftFlag = true;
        this.rightFlag = false;
    }

    _rightStart(e) {
        if(this.warnWord())return;
        this.leftFlag = false;
        this.rightFlag = true;
    }
    warnWord(){
        if(!this.startGame){
            this.warnLab.string = "该死,先开始游戏才能移动小怪兽!!!";
            this.warnLab.node.runAction(
                cc.sequence(
                    cc.fadeIn(0.2),
                    cc.fadeOut(1),
                )
            );
            return true;
        };
        return false;
    }
    onDestroy() {
        GD.monsterCollider = false;
    }
    update(dt) {
        Utils.openDebugDraw(this.debug, "collider");
        if (this.leftFlag) {
            this.speed -= 800 * dt;
            if (this.speed <= -this.speed_max) {
                this.speed = -this.speed_max;
            }
        } else if (this.rightFlag) {
            this.speed += 800 * dt;
            if (this.speed >= this.speed_max) {
                this.speed = this.speed_max;
            }
        }
        this.ball.x += this.speed * dt;
    }
}
