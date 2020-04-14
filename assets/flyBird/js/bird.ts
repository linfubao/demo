
const { ccclass, property } = cc._decorator;
import G from "../../utils/global";
@ccclass
export default class Bird extends cc.Component {

    @property(cc.Node)
    btnPlay: cc.Node = null;

    onLoad() {
        
    }

    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        // console.log('self', selfCollider.node.getBoundingBox(), "other", otherCollider.node);
        G.gameOver = true;
    }

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {

    }

    // 每次将要处理碰撞体接触逻辑时被调用
    onPreSolve(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {

    }

    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {

    }

    // update (dt) {}
}
