
const {ccclass, property} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {

    @property(cc.Node)
    menuNode:cc.Node = null;
    box:cc.Node = null;
    onLoad () {
        
    }
    menuBtn(e:cc.Event){                
        let btn = e.target;        
        this.box = this.node.getChildByName('box');
        let action = cc.sequence(
            cc.fadeOut(0.2),
            cc.callFunc(function(){                
                this.box.active = true;
                this.box.runAction(cc.fadeIn(0.2));
            },this),
            cc.callFunc(function(){
                this.scheduleOnce(()=>{
                    this.box.runAction(cc.fadeOut(0.1));
                    this.box.active = false;
                    btn.runAction(cc.fadeIn(0.2));
                },2);
            },this)
        );
        btn.runAction(action);
    }
    fadeOut(scene){
        let _t = 0.2;
        this.node.parent.runAction(cc.fadeOut(_t));
        this.scheduleOnce(()=>{
            cc.director.loadScene(scene);
        },0.15);
    }
    goBirdScene(){        
        this.fadeOut("flayBird");
    }
    goArrowScene(){
        this.fadeOut("arrow");
    }
    goCutScene(){
        console.log("标记1");
        
        this.fadeOut('cutMain');
    }
    goMonsterScene(){
        console.log("标记2");

        this.fadeOut('Monster');
    }
}
