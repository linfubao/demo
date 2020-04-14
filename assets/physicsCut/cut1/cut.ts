
const { ccclass, property } = cc._decorator;

@ccclass
export default class Cut extends cc.Component {

    @property(cc.Node)
    penNode:cc.Node = null;

    @property(cc.Graphics)
    pen:cc.Graphics = null;

    @property(cc.Node)
    gameLayer: cc.Node = null;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        // cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit| cc.PhysicsManager.DrawBits.e_shapeBit;
        this.node.on("touchstart", (e) => {
            let start_ps:cc.Vec2 = this.node.convertToNodeSpaceAR(e.getStartLocation());
        }, this);
        this.node.on("touchmove", (e) => {
            this.pen.clear();
            let start_ps:cc.Vec2 = this.node.convertToNodeSpaceAR(e.getStartLocation());
            let ps:cc.Vec2 = this.node.convertToNodeSpaceAR(e.getLocation());            
            this.pen.moveTo(start_ps.x,start_ps.y);//起点
            this.pen.lineTo(ps.x,ps.y);//终点
            this.pen.stroke();//画
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, (e) => {
            const p1 = e.getStartLocation();
            const p2 = e.getLocation();
            this.cut(p1, p2);
        }, this);
    }
    cut(p1,p2){
        /**
         * res1.point :世界坐标
         */
        let result1 = cc.director.getPhysicsManager().rayCast(p1,p2,cc.RayCastType.Closest);
        let result2 = cc.director.getPhysicsManager().rayCast(p2,p1,cc.RayCastType.Closest);
        console.log(result1,result2);
        if (result1.length === 0 || result2.length === 0) {
            console.warn('无碰撞体');
            return;
        }
        if (result1[0].collider !== result2[0].collider) {
            console.warn('不是单独碰撞体');
            return;
        }
        if (!(result1[0].collider instanceof cc.PhysicsPolygonCollider)) {
            console.warn('非多边形物理碰撞盒无points属性');
            return;
        }
        const collider = result1[0].collider;
        let localPoint1 = cc.Vec2.ZERO;
        let localPoint2 = cc.Vec2.ZERO;
        //将一个给定的世界坐标系下的点转换为刚体本地坐标系下的点
        collider.body.getLocalPoint(result1[0].point, localPoint1);
        collider.body.getLocalPoint(result2[0].point, localPoint2);
        const points = collider.points;//此时的points是本地坐标系下的
        let index1 = undefined;
        let index2 = undefined;
        console.log("points: ",points);
        for (let i = 0; i < points.length; i++) {
            let p1 = points[i];
            let p2 = i === points.length - 1 ? points[0] : points[i + 1];
            console.log("localPoint1: ",localPoint1);
            console.log("localPoint2: ",localPoint2);
            if (this.pointInLine(localPoint1, p1, p2)) {
                index1 = i;
            }
            if (this.pointInLine(localPoint2, p1, p2)) {
                index2 = i;
            }
            if (index1 !== undefined && index2 !== undefined) {
                break;
            }
        }
        console.log(`点1下标${index1}`);
        console.log(`点2下标${index2}`);
        // 一次循环，装入两个点数组
        const array1 = [];
        const array2 = [];
        // 碰到 index1 或 index2 标志
        let time = 0;
        for (let i = 0; i < points.length; i++) {
            let temp = points[i].clone();
            if (time === 0) {
                array1.push(temp);
            } else {
                array2.push(temp);
            }
            if ((i === index1 || i === index2) && time === 0) {
                array1.push(i === index1 ? localPoint1.clone() : localPoint2.clone());
                array2.push(i === index1 ? localPoint1.clone() : localPoint2.clone());
                time = 1;
            } else if ((i === index1 || i === index2) && time === 1) {
                array2.push(i === index1 ? localPoint1.clone() : localPoint2.clone());
                array1.push(i === index1 ? localPoint1.clone() : localPoint2.clone());
                time = 0;
            }
        }
        console.log(array1,array2);
        // 设置第一个碰撞体
        collider.points = array1;
        collider.apply();
        collider.node.getComponent("item").draw();
        // 克隆一个本体作为第二个
        const cloneNode = cc.instantiate(collider.node);
        this.gameLayer.addChild(cloneNode);
        const comp = cloneNode.getComponent(cc.PhysicsPolygonCollider);
        comp.points = array2;
        comp.apply();
        cloneNode.getComponent('item').draw();
    }

    /** 近似判断点在线上 */
    pointInLine (point, start, end) {
        const dis = 1;
        return cc.Intersection.pointLineDistance(point, start, end, true) < dis;
    }
    update (dt) {

    }
}
