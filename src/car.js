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
            this.transform.rotation.y += Math.sign(this.initYrot - this.transform.rotation.y) * 0.005;
        }
    }

    constructor(gl) {
        super("bus2", mesh, gl);
    }
    /**
     * @public
     */
    start(){
        this.transform.scale.x = 1;
        this.transform.scale.y = 1;
        this.transform.scale.z = 1;
        this.transform.position.z = 10;
        this.transform.position.y = 1;
    }

    /**
     * @public
     */
    update(event){
        //this.transform.rotation.y += 0.08;

        console.log(this.transform.rotation.y)

        switch (event){
            case 'd':
                this.transform.position.x += 0.05;
                this.transform.rotation.y = 0.08;
                break;
            case 'a':
                this.transform.position.x -= 0.05;
                this.transform.rotation.y = -0.08;
                break;
        }
        this.ClampYRotate();
    }
}

export default Car;