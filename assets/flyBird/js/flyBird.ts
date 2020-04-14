import G from "../../utils/global";
const { ccclass, property } = cc._decorator;
@ccclass
export default class Helloworld extends cc.Component {
    @property(cc.Label)
    scoreLab: cc.Label = null;
    @property(cc.Label)
    recordLab: cc.Label = null;
    @property(cc.Node)
    bg1: cc.Node = null;
    @property(cc.Node)
    bg2: cc.Node = null;
    @property(cc.Prefab)
    up: cc.Prefab = null;
    @property(cc.Prefab)
    down: cc.Prefab = null;
    @property(cc.RigidBody)
    bird: cc.RigidBody = null;
    @property(cc.Node)
    pipeBox: cc.Node = null;
    @property(cc.Node)
    btnPlay: cc.Node = null;
    @property(cc.Node)
    logo: cc.Node = null;
    @property(cc.Node)
    labBox: cc.Node = null;
    @property({
        type: [cc.AudioClip],
    })
    audioPaths: cc.AudioClip[] = [];
    @property
    velocity: cc.Vec2 = cc.v2(0, 0);
    @property
    speed: number = 0;

    physicsMng = cc.director.getPhysicsManager();
    viewWidth: number = null;
    viewHeight: number = null;
    upPool: cc.NodePool = null;
    downPool: cc.NodePool = null;
    score: number = 0;
    _now_time: number = 0;

    onLoad() {
        cc.director.getCollisionManager().enabled = true;
        this.physicsMng = cc.director.getPhysicsManager();
        this.physicsMng.enabled = true;
        this.physicsMng.gravity = cc.v2(0, 0);
        // cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit | cc.PhysicsManager.DrawBits.e_jointBit | cc.PhysicsManager.DrawBits.e_shapeBit
        cc.sys.localStorage.setItem("score",JSON.stringify({score:0}));

        this.viewWidth = cc.view.getVisibleSize().width;
        this.viewHeight = cc.view.getVisibleSize().height;
        this.fitterGround();
        this.pools();
        this.showRecord();
        this.node.off("touchend");
        this.btnPlay.active = true;
        G.gameOver = false;
    }
    fitterGround(){
        this.bg1.width = this.viewWidth;
        this.bg1.getComponent(cc.PhysicsBoxCollider).size.width = this.viewWidth;
        this.bg2.width = this.viewWidth;
        this.bg2.getComponent(cc.PhysicsBoxCollider).size.width = this.viewWidth;
    }
    showRecord(){
        let data:any = JSON.parse(cc.sys.localStorage.getItem('score'));
        this.recordLab.string = String(data.score);
    }
    pools() {
        this.upPool = new cc.NodePool();
        for (let i = 0; i < 5; i++) {
            let node: cc.Node = cc.instantiate(this.up);
            this.upPool.put(node);
        }
        this.downPool = new cc.NodePool();
        for (let i = 0; i < 5; i++) {
            let node: cc.Node = cc.instantiate(this.down);
            this.downPool.put(node);
        }
    }
    _touchEnd(e: cc.Event.EventTouch) {
        cc.audioEngine.playMusic(this.audioPaths[0],false);
        this.bird.linearVelocity = this.velocity;
    }
    playGame() {
        this.physicsMng.gravity = cc.v2(0, -1600);//重力>0,会上升; <0,越小下落速度越快
        this.btnPlay.active = false;
        this.logo.active = false;
        this.labBox.active = true;
        this.node.on("touchend", this._touchEnd, this);
        this.newPipeline();
    }
    //生成上下两个管道
    newPipeline() {
        let self = this;
        let num: number = 0;
        this.schedule(() => {
            let node1: cc.Node = self.newPipe("up", self.up);
            let node2: cc.Node = self.newPipe("down", self.down);
            num += 1;
            self.intPipeAttr(num, node1, node2);
            self.pipeBox.addChild(node1);
            self.pipeBox.addChild(node2);
        }, 2);
    }
    //新生产的管道进行初始设置
    intPipeAttr(num: number, node1: cc.Node, node2: cc.Node) {
        node1.name = "upPipe" + num;
        node2.name = "downPipe" + num;
        let x: number = this.viewWidth / 2 + 100;
        let max: number = 200;
        let min: number = 120;
        let y: number = Math.random() * (max - min) + min;
        node1.setPosition(x, y);
        node2.setPosition(x, 0);
    }
    newPipe(pool: string, prefab: cc.Prefab) {
        let newPool: cc.NodePool = pool == "up" ? this.upPool : this.downPool;
        let node: cc.Node = null;
        if (newPool.size() > 0) {
            node = newPool.get();
        } else {
            node = cc.instantiate(prefab);
        }
        return node;
    }
    //地面移动
    groundMove() {
        if (G.gameOver) return;
        this.bg1.x -= this.speed;
        this.bg2.x -= this.speed;
        if (this.bg1.x <= -this.viewWidth / 2 && this.bg2.x <= 0) {
            this.bg1.x = this.viewWidth;
        }
        if (this.bg2.x <= -this.viewWidth / 2 && this.bg1.x <= 0) {
            this.bg2.x = this.viewWidth;
        }
    }
    //管道移动
    pipeMove() {
        if (G.gameOver) return;
        let arr = this.pipeBox.children;
        if (arr.length > 0) {
            for (let i in arr) {
                arr[i].x -= this.speed;
                if (arr[i].x < (-this.viewWidth / 2 - 100)) {
                    if (arr[i].name.substr(0, 2) == "up") {
                        this.upPool.put(arr[i]);
                    } else {
                        arr[i].getComponent('countScore').flag = false;
                        this.downPool.put(arr[i]);
                    }
                }
            }
        }
    }
    update(dt) {
        this.groundMove();
        this.pipeMove();
        if (G.gameOver) {
            cc.director.loadScene("flayBird");
        }
    }
}
/**
 * 你是想要两个向量的夹角吗
let v1 = cc.v2(100,100);
let v2 = cc.v2(100,0); // x轴正方向
let angle = v1.angle(v2); // 这是不带方向的弧度制的角度值
let signAngle = v1.signAngle(v2); // 这是带方向的弧度制的角度值
 */
