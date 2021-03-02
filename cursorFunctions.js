var cursorFunctions = {

    moveAlongNormal: function (v_index, mesh){
        mesh.addVertexPosition(v_index, vec3.multiplyByConstant(this.normal, 1/32));
    },

    setColor: function (v_index, mesh){
        mesh.setVertexColor(v_index, this.color);
    },

    addColor: function (v_index, mesh){
        mesh.addVertexColor(v_index, this.color);
    }


}