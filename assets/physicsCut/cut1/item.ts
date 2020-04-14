
const {ccclass, property} = cc._decorator;

@ccclass
export default class Grap extends cc.Component {
    onLoad () {
        this.draw();
    }
    draw () {
        console.log(this.node);
        let points = this.node.getComponent(cc.PhysicsPolygonCollider).points;
        let ctx = this.node.getComponent(cc.Graphics);
        ctx.clear();
        const len = points.length;
        ctx.moveTo(points[len - 1].x, points[len - 1].y);
        for (let i = 0; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.fill();
    }

    update (dt) {

    }
}
