import Object from './Object'
import mesh from 'bundle-text:../assets/bus2.obj'

class Car extends Object{
    initYrot = 0;

    _move_objects;

    /**
     *
     * @param step
     * @private
     */
    ClampYRotate(step = 0.005) {
        if (Math.abs(this.initYrot - this.transform.rotation.y) > step)
        {
            this.transform.rotation.y += Math.sign(this.initYrot - this.transform.rotation.y) * step;
        }
    }

    constructor(gl) {
        super("bus2", mesh, gl);
    }

    /**
     * @public
     */
    start(){
        this.transform.scale.x = 0.03;
        this.transform.scale.y = 0.03;
        this.transform.scale.z = 0.03;
        this.transform.position.y = 0.03;
    }

    /**
     * @public
     */
    update(event){
        switch (event){
            case 'd':
                this.transform.position.x -= 0.01;
                this.transform.rotation.y = -0.08;
                console.log(this.transform.position)
                break;
            case 'a':
                this.transform.position.x += 0.01;
                this.transform.rotation.y = 0.08;
                console.log(this.transform.position)
                break;
        }
        this.ClampYRotate();

    }
}

export default Car;