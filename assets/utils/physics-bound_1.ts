const {ccclass, property} = cc._decorator;

@ccclass
export default class Bound extends cc.Component {
    @property({
        tooltip:"场景的尺寸,默认使用适配的尺寸"
    })
    viewSize:cc.Vec2 = null;

    @property({
        tooltip:"宽、高、tag"
    })
    topWall:cc.Vec3 = null;
    @property({
        tooltip:"宽、高、tag"
    })
    buttomWall:cc.Vec3 = null;
    @property({
        tooltip:"宽、高、tag"
    })
    leftWall:cc.Vec3 = null;
    @property({
        tooltip:"宽、高、tag"
    })
    rightWall:cc.Vec3 = null;

    @property({
        tooltip:""
    })
    mouseJoint:boolean = true;

    onLoad () {
        let width = this.viewSize.x || this.node.width;
        let height = this.viewSize.y || this.node.height;

        let node = new cc.Node("wall");

        let body = node.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;

        if (this.mouseJoint) {
            let joint = node.addComponent(cc.MouseJoint);
            joint.mouseRegion = this.node;
        }

        this._addBound(node, 0, height / 2, width, this.topWall.y ,this.topWall.z);//上
        this._addBound(node, 0, -height / 2, width, this.buttomWall.y ,this.buttomWall.z);//下
        this._addBound(node, -width / 2, 0, this.leftWall.x, height,this.leftWall.z);//左
        this._addBound(node, width / 2, 0, this.rightWall.x, height,this.rightWall.z);//右

        node.parent = this.node;
    }
    _addBound(node, x, y, width, height, tag) {
        let collider = node.addComponent(cc.PhysicsBoxCollider);
        collider.tag = tag;
        collider.offset.x = x;
        collider.offset.y = y;
        collider.size.width = width;
        collider.size.height = height;
    }
}
