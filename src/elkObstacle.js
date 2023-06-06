import Object from "./Object";

class ElkObstacle extends Object{
    /**
     * @private
     * @type {number}
     */
    speed = 0.2;
    xPositions = [0,10,-10]
    constructor(id, mesh, gl, scale) {
        super(id, mesh, gl);
        if (scale !== undefined){
            this.initScale = scale;
        }
    }

    start(){
        this.transform.rotation.y = Math.PI;

        if (this.initScale !== undefined){
            this.transform.scale = this.initScale;
        }
    }

    update(){
        const init_pos = -100;
        if (this.transform.position.z >= -init_pos)
        {
            this.transform.position.z = init_pos;
            const item = this.xPositions[Math.floor(Math.random()*this.xPositions.length)];
            this.transform.position.x = item;
        }

        this.transform.position.z += this.speed;
    }
}

export default ElkObstacle;