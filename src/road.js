import Object from "./Object";
import mesh from 'bundle-text:../assets/road.obj'
class Road extends Object{
    speed = 0.2;
    constructor(gl, z, x) {
        super('road', mesh, gl);
        this.transform.position.z = z;
        this.transform.position.y = x;
    }

    start()
    {
        this.transform.scale.x = 1;
        this.transform.scale.y = 1;
        this.transform.scale.z = 0.7;
        this.transform.rotation.z = 3.1415;
    }
    update(event)
    {
        const init_pos = -99;
        if (this.transform.position.z >= -init_pos)
        {
            this.transform.position.z = init_pos;
        }

        this.transform.position.z += this.speed;
        //this.speed += 0.01
    }
    setSlow() {
        this.speed = 0.01;
    }
    setFast() {
        this.speed = 0.03;
    }
}

export default Road;