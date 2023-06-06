import Object from "./Object";
import Vector3 from "./Vector3";

class Light extends Object{
    /**
     * @private
     * @type {number}
     */
    speed = 0.2;
    xPositions = [0,10,-10]
    constructor(id, mesh, gl) {
        super(id, mesh, gl);
    }

    start(){
        this.transform.rotation.y = Math.PI;
        this.transform.scale = new Vector3(0.02,0.03,0.02);
        this.transform.position.x = -15;
    }

    update(){
        const init_pos = -100;
        if (this.transform.position.z >= -init_pos)
        {
            this.transform.position.z = init_pos;
            //const item = this.xPositions[Math.floor(Math.random()*this.xPositions.length)];
            //this.transform.position.x = item;
        }

        this.transform.position.z += this.speed;
    }
}

export default Light;