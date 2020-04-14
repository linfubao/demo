import { array, EventTouch } from './../creator.d';

const {ccclass, property} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {

    @property(cc.Node)
    menuNode:cc.Node = null;
    box:cc.Node = null;
    onLoad () {
        
    }
    menuBtn(e:EventTouch){        
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
    goBirdScene(){        
        cc.director.loadScene("flayBird");
    }
    goArrowScene(){
        cc.director.loadScene("arrow");
    }
    goCutScene(){
        cc.director.loadScene('cutMain');
    }
}
