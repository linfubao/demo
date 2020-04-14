// 重力
let G = -640;
// 固定速度
let V = 1300;

let { ccclass, property } = cc._decorator;
@ccclass
export default class Arrow extends cc.Component {
    //弓
    @property(cc.Node)
    arch: cc.Node = null;
    @property(cc.Prefab)
    arrowPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    boomArrow: cc.Prefab = null;
    @property(cc.Node)
    arrowBox: cc.Node = null;
    @property(cc.Node)
    enemy: cc.Node = null;
    @property(cc.Node)
    upBow: cc.Node = null;//上弦
    @property(cc.Node)
    downBow: cc.Node = null;//下弦
    @property({
        type:cc.Toggle,
        tooltip:"是否开启物理调试信息"
    })
    debugDraw: cc.Toggle = null;
    @property({
        type:cc.Toggle,
        tooltip:"是否允许射箭"
    })
    canFire: cc.Toggle = null;

    arrowPool: cc.NodePool = null;
    arrowNode: cc.Node = null;
    _linearVelocity_1: cc.Vec2 = cc.v2(0, 0);// 平抛线性初速度
    linearArr: cc.Vec2[] = [];
    start_ps: cc.Vec2 = cc.v2(0, 0);//箭的初始位置
    view_w: number = null;
    view_h: number = null;
    index: number = 0;

    creatPool() {
        let arrowPool = new cc.NodePool();
        for (let i = 0; i < 15; i++) {
            let node = cc.instantiate(this.arrowPrefab);
            arrowPool.put(node);
        }
        this.arrowPool = arrowPool;
    }
    onDisable() {
        cc.director.getPhysicsManager().enabled = false;
    }
    physicsManager() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, G);
    }
    onLoad() {
        cc.debug.setDisplayStats(false);//强制关闭Show FPS
        this.physicsManager();
        this.fitterView();
        this.creatPool();
        this.creatOneArrow();
        this.touchEvent();

    }
    fitterView() {
        this.view_w = cc.view.getVisibleSize().width;
        this.view_h = cc.view.getVisibleSize().height;
        this.arch.setPosition(-this.view_w / 2 + 150, -this.view_h / 2 + 210);
        cc.find('Canvas/bg/wall').setPosition(this.view_w / 2, 0);
    }
    touchEvent() {
        this.node.on("touchstart", this._touchStart, this);
        this.node.on("touchend", this._touchEnd, this);
        this.node.on("touchmove", this._touchMove, this);
        this.node.on("touchcancel", this._touchCancel, this);
    }
    creatOneArrow() {
        let arrow: cc.Node = null;
        if (this.arrowPool.size() > 0) {
            arrow = this.arrowPool.get();
        } else {
            arrow = cc.instantiate(this.arrowPrefab);
        }
        arrow.setPosition(this.arch.getPosition());
        arrow.angle = this.arch.angle;
        this.arrowBox.addChild(arrow);
        arrow.getComponent("arrow").getPool(this.arrowPool);
    }
    _touchStart(e) {
        this.pullArrow(e);
        this.drawAimCircle(e);
    }
    _touchMove(e) {
        this.drawAimCircle(e);
        this.pullRange(e);//限制拉弓的范围
        this.bowAction();
        this.pullArrow(e);
    }
    _touchEnd(e) {
        if(this.canFire.isChecked){
            this.fireArrow();
            this.resetAll();
            this.creatOneArrow();
            this.index = this.arrowBox.children.length - 1;
        }
    }
    _touchCancel(e) {
        this.resetAll();
    }
    drawAimCircle(e){
        let ps = this.node.convertToNodeSpaceAR(e.getLocation());
        let pen = cc.find('Canvas/draw').getComponent(cc.Graphics);        
        pen.clear();
        pen.circle(ps.x,ps.y,10);
        pen.stroke();
    }
    pullArrow(e) {
        //这两个左边是关键
        // 这两个坐标都有讲究的,都为本地坐标
        let location = this.node.convertToNodeSpaceAR(e.getLocation());
        let startPs = this.arch.getPosition();
        
        //计算点击坐标和弓箭起始坐标的距离
        let s = location.x - startPs.x;//水平位移
        let h = location.y - startPs.y;//垂直位移  

        // a*t^2 + b*t + c = 0
        let a = G * s / (2 * V * V);
        let b = 1;
        let c = a - h / s;
        let delta = b * b - 4 * a * c;

        if (delta >= 0) {
            // 一元二次方程求根公式    求平方根:Math.sqrt(9) = 3;
            let t1 = (-b + Math.sqrt(delta)) / (2 * a); // 平抛 tan 值
            // 二、三象限角度要加 180
            let alpha1 = Math.atan(t1) + (s < 0 ? Math.PI : 0);
            let v_x_1 = Math.cos(alpha1) * V;
            let v_y_1 = Math.sin(alpha1) * V;
            this._linearVelocity_1.x = v_x_1;
            this._linearVelocity_1.y = v_y_1;
        } else {
            this._linearVelocity_1 = cc.Vec2.ZERO;
        }

        if (Math.abs(this._linearVelocity_1.x) > 0) {
            //计算弓箭的旋转角度
            const angle = this._linearVelocity_1.signAngle(cc.v2(1, 0));
            this.arrowBox.children[this.index].angle = -(angle * 180 / Math.PI);
            this.arch.angle = -(angle * 180 / Math.PI);
        }
    }

    //限制拉弓的范围
    pullRange(e) {
        let location = e.getLocation();
        let speed = 0.2;
        let start_ps = e.getStartLocation();
        let dis = start_ps.x - location.x;//计算鼠标移动距离        
        let arrow = this.arrowBox.children[this.index];
        if (dis < 0) {
            if (arrow.x >= this.arch.x) return;
            arrow.x += speed;
            arrow.y += speed;
        } else if (dis > 0) { //往后拉            
            if (arrow.x <= this.arch.x - 20) return;
            arrow.x -= speed;
            arrow.y -= speed;
        }
    }

    //弦的拉伸效果,还有一个重点是锚点的设置,锚点为转点,依靠弓的两侧进行旋转
    bowAction() {
        //已知:x: 箭的移动距离  y:this.arch.height/2, 求弦的角度和长度
        let arrow = this.arrowBox.children[this.index];
        let x = Math.abs(this.arch.x - arrow.x);
        let y = this.arch.height / 2;
        let r = Math.atan2(x, y); //Math.atan2(对边,临边);
        let d = r * 180 / Math.PI; //弦的旋转角度
        this.upBow.angle = -d;
        this.downBow.angle = d;
        let sum = Math.pow(x, 2) + Math.pow(y, 2);
        this.upBow.height = Math.sqrt(sum);
        this.downBow.height = Math.sqrt(sum);
    }

    //重置弓和箭的ui
    resetAll() {
        // this.arch.angle = 0;
        this.upBow.width = 2;
        this.upBow.height = this.arch.height / 2;
        this.upBow.angle = 0;
        this.upBow.color = cc.Color.WHITE;
        this.downBow.width = 2;
        this.downBow.height = this.arch.height / 2;
        this.downBow.angle = 0;
        this.downBow.color = cc.Color.WHITE;
    }

    mathDegree(location: cc.Vec2) {
        let r = Math.atan2(location.y, location.x);//先计算角度的弧度值r
        let d: number = r * 180 / Math.PI;//再套公式
        return d;
    }

    fireArrow() {
        this.linearArr.push(this._linearVelocity_1.clone());
        this.arrowBox.children[this.index].getComponent('arrow').fireArrow(this.linearArr[this.index]);
        // this.arrowBox.children[this.index].getComponent(cc.PhysicsBoxCollider).tag = this.index;
    }
    update(dt) {
        if (this.debugDraw.isChecked) {
            cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit | cc.PhysicsManager.DrawBits.e_jointBit | cc.PhysicsManager.DrawBits.e_shapeBit;
            cc.find('Canvas/bg').opacity = 25;
        } else {
            cc.director.getPhysicsManager().debugDrawFlags = 0;
            cc.find('Canvas/bg').opacity = 200;
        }
    }
}
