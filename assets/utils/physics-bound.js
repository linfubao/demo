
cc.Class({
    extends: cc.Component,

    properties: {
        size: cc.size(0, 0),
        mouseJoint: true
    },

    onLoad: function () {
        let width = this.size.width || this.node.width;
        let height = this.size.height || this.node.height;

        let node = new cc.Node("wall");

        let body = node.addComponent(cc.RigidBody);//RigidBody:物理组件
        body.type = cc.RigidBodyType.Static;//刚体类型:静态

        if (this.mouseJoint) {
            // add mouse joint
            let joint = node.addComponent(cc.MouseJoint);
            joint.mouseRegion = this.node;
        }

        this._addBound(node, 0, height / 2, width, 5,0);//上
        this._addBound(node, 0, -height / 2, width, 100,0);//下
        this._addBound(node, -width / 2, 0, 5, height,1);//左
        this._addBound(node, width / 2, 0, 5, height,1);//右

        node.parent = this.node;
    },

    _addBound(node, x, y, width, height, tag) {
        let collider = node.addComponent(cc.PhysicsBoxCollider);
        collider.tag = tag;
        collider.offset.x = x;
        collider.offset.y = y;
        collider.size.width = width;
        collider.size.height = height;
    }
});
