import Object from './Object'
import mesh from 'bundle-text:../assets/car3.obj'
import Vector3 from "./Vector3";

class Car extends Object{
    initYrot = 0;

    _move_objects;
    _setSlowEvent;
    _isSlow = false;
    /**
     *
     * @param step
     * @private
     */
    ClampYRotate(step = 0.005) {
        if (Math.abs(this.initYrot - this.transform.rotation.y) > step)
        {
            this.transform.rotation.y += Math.sign(this.initYrot - this.transform.rotation.y) * 0.005;
        }
    }

    /**
     *
     * @param gl
     * @param obstacles {Array<ElkObstacle>}
     */
    constructor(gl, obstacles, loseEvent, setSlowEvent, setFastEvent) {
        super("image", mesh, gl);
        this._obstacles = obstacles;
        this._loseEvent = loseEvent;
        this._setSlowEvent = setSlowEvent;
        this._setFastEvent = setFastEvent;
    }
    /**
     * @public
     */
    start(){
        this.transform.scale.x = 0.004
        this.transform.scale.y = 0.004;
        this.transform.scale.z = 0.004;
        this.transform.position.z = 10;
        this.transform.position.y = 5;
        this.transform.position.y = 1;
        this.transform.rotation.y  = Math.PI
        this.initYrot = Math.PI

    }

    /**
     * @public
     */
    update(event){
        // smooth movement
        switch (event){
            case 'd':
                this.transform.position.x += 0.05;
                this.transform.rotation.y = this.initYrot + 0.08;
                break;
            case 'a':
                this.transform.position.x -= 0.05;
                this.transform.rotation.y = this.initYrot -0.08;
                break;
        }
        this.ClampYRotate();

        // obstacles
        for (const obstacle of this._obstacles) {
            const tempVec = this.transform.position;
            const pos = new Vector3(tempVec.x , tempVec.y, tempVec.z - 4);
            if (Vector3.distance(obstacle.transform.position, pos) < 2){
                this._loseEvent();
            }
        }

        // set slow

        if(Math.abs(this.transform.position.x) > 13 ){
            this._isSlow = true;
            this._setSlowEvent();
        }
        else if(this._isSlow){
            this._setFastEvent();
        }
    }
}

export default Car;