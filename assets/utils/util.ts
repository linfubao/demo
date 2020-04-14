let utils = {
    /**
     * @param node 
     * @param type : physics/collider
     */
    openDebugDraw(node:cc.Toggle,type:string){
        if(type=="physics"){
            if(node.isChecked){
                cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit|cc.PhysicsManager.DrawBits.e_jointBit|cc.PhysicsManager.DrawBits.e_shapeBit;
            }else{
                cc.director.getPhysicsManager().debugDrawFlags = 0;
            }
        }else{
            if(node.isChecked){
                cc.director.getCollisionManager().enabledDebugDraw = true;
            }else{
                cc.director.getCollisionManager().enabledDebugDraw = false;
            }
        }
    },
    getViewSize(){
        let width = cc.view.getVisibleSize().width;
        let height = cc.view.getVisibleSize().height;
        return {width:width,height:height};
    },
}
export default utils;
