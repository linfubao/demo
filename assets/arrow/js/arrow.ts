
const { ccclass, property } = cc._decorator;

@ccclass
export default class Arrow extends cc.Component {
    arrowPool: cc.NodePool = null;
    weldJoint: cc.WeldJoint = null;//焊接关节
    contactFlag: boolean = false;

    onLoad() {
        
    }
    getPool(pool: cc.NodePool) {
        this.arrowPool = pool;
    }
    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact, self, other) {
        // console.log(contact,"self", self.node, "other", other.node);
        // console.log(other.node.getComponent(cc.PhysicsBoxCollider).tag);
        if(other.node.name == 'roof'){
            other.node.active = false;
        }
        if (other.node.name === 'arrow') {
            return;
        }
        if (other.node.name === 'wall' || other.node.name === 'enemy') {
            this.contactFlag = true;
            let joint = self.getComponent(cc.WeldJoint);
            if (joint.enabled) {
                joint.enabled = false;
            }
            let arrowBody = self.body;
            let targetBody = other.body;
            let worldCoordsAnchorPoint1 = arrowBody.getWorldPoint(cc.v2(0, 0));//将一个给定的刚体本地坐标系下的点转换为世界坐标系下的点
    
            joint.connectedBody = targetBody;
            joint.anchor = arrowBody.getLocalPoint(worldCoordsAnchorPoint1);
            joint.connectedAnchor = targetBody.getLocalPoint(worldCoordsAnchorPoint1);
            joint.referenceAngle = arrowBody.node.angle;
            joint.enabled = true;
        }
    }
    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve(contact, self, other) {
        // console.log(contact,"self", self.node, "other", other.node);        
    }

    //发射弓箭
    fireArrow(velocity: cc.Vec2) {        
        let linearVelocity = velocity;
        if (Math.abs(linearVelocity.x) > 0) {
            let rigidBody_arrow = this.node.getComponent(cc.RigidBody);
            rigidBody_arrow.type = cc.RigidBodyType.Dynamic;
            rigidBody_arrow.linearVelocity = linearVelocity;
        }
    }

    update(dt) {    
        if (this.contactFlag) {
            return;
        }
        let rigidBody = this.node.getComponent(cc.RigidBody);
        if (Math.abs(rigidBody.linearVelocity.x) > 0) {
            // 计算夹角                         
            let angle = rigidBody.linearVelocity.signAngle(cc.v2(1, 0));
            rigidBody.node.angle = -(angle * 180 / Math.PI);
        }
    }
}
