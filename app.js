
const cursor_states = {
    SELECT: 'select',
    PAINT: 'paint',
    ERASE: 'erase'
}

red = document.getElementById("red").value;
green = document.getElementById("green").value;
blue = document.getElementById("blue").value;
alpha = 255;

var CanvasViewport = {

    canvas: 0,
    ctx: 0,

    id_canvas: 0,
    id_ctx: 0,

    id_xpos: 0,
    id_ypos: 0,
    id_scale_factor: 0,

    img_data: 0,

    previous_mouse_xpos: 0,
    previous_mouse_ypos: 0,

    mouse_xpos: 0,
    mouse_ypos: 0,

    mouse_state: 0,

    init: function (canvas_name) {

        canvas = document.getElementById(canvas_name);
        ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = false;

        // This sets up the 2nd canvas that the image data will completely fill up, 
        // and the ctx drawImage function will scale it to the viewport canvas

        id_canvas = document.createElement("canvas");
        id_ctx = id_canvas.getContext("2d")

        img_data = id_ctx.createImageData(4, 4);

        id_canvas.width = img_data.width;
        id_canvas.height = img_data.height;

        id_xpos = 0;
        id_ypos = 0;
        id_scale_factor = 30;

        previous_mouse_x = 0;
        previous_mouse_ypos = 0;

        mouse_xpos = 0;
        mouse_ypos = 0;

        mouse_state = cursor_states.PAINT;

        for (var i = 0; i < img_data.data.length; i += 4) {
            img_data.data[i] = Math.floor(Math.random() * 256);
            img_data.data[i + 1] = Math.floor(Math.random() * 256);
            img_data.data[i + 2] = Math.floor(Math.random() * 256);
            img_data.data[i + 3] = 255;
        }

    },

    draw: function () {

        //console.log("update function called");
        id_ctx.clearRect(0, 0, id_canvas.width, id_canvas.height);
        id_ctx.putImageData(img_data, 0, 0);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(id_canvas, id_xpos, id_ypos, img_data.width * id_scale_factor, img_data.height * id_scale_factor);
        this.drawGrid(id_xpos, id_ypos, img_data.width * id_scale_factor, img_data.height * id_scale_factor, img_data.width, img_data.height);
    },

    drawGrid: function (start_x, start_y, w, h, w_tiles, h_tiles) {

        ctx.lineWidth = 1;

        for (i = 0; i <= w; i += (w / w_tiles)) {
            ctx.beginPath();
            ctx.moveTo(start_x + i, start_y);
            ctx.lineTo(start_x + i, start_y + h);
            ctx.stroke();
        }

        for (i = 0; i <= h; i += (h / h_tiles)) {
            ctx.beginPath();
            ctx.moveTo(start_x, start_y + i);
            ctx.lineTo(start_x + w, start_y + i);
            ctx.stroke();
        }
    },

    changeMouseState: function (state) {

        //document.getElementById("mousePos").innerHTML = "in the change state function";
        mouse_state = state;
    },

    modifyImageData: function (xval, yval, r, g, b, a) {

        //document.getElementById("mousePos").innerHTML = xval + " " + yval + " " + img_data.width +  " " + img_data.height;

        // where to move this check, mouse function?
        if (((xval > img_data.width - 1) || (xval < 0)) || ((yval > img_data.height - 1) || yval < 0)) {
            return;
        }

        var array_index = 4 * (xval + (yval * img_data.width));

        // document.getElementById("mousePos").innerHTML = xval + " " + yval + " " + img_data.width +  " " + img_data.height + " " + array_index;

        img_data.data[array_index] = r;
        img_data.data[array_index + 1] = g;
        img_data.data[array_index + 2] = b;
        img_data.data[array_index + 3] = a;
    },

    resizeImage: function (w, h) {

        var new_data = new ImageData(w, h);

        //This loops through the original image in pixel coordiantes
        rows:
        for(var i = 0; i < img_data.height; i++){
            for(var j = 0; j < img_data.width; j++){


                // If there are no rows to copy over the original image, then the copying is done and you can break out of the function
                if(i >= new_data.height){
                    break rows;
                }

                // If there is no more space in the new image for the current row, you can move on to the next row
                if(j >= new_data.width){
                    break;
                }

                else{
                    var old_array_index = 4 * (j + (i * img_data.width));
                    var new_array_index = 4 * (j + (i * new_data.width));

                    // Each pixel has 4 consecutive values (r,g,b,a) in the imageData data array
                    for(var x = 0; x < 4; x++){
                        new_data.data[new_array_index + x] = img_data.data[old_array_index + x]
                    }

                }
            }
        }

        img_data = new_data;

        id_canvas.width = new_data.width;
        id_canvas.height = new_data.height;

        this.draw()
    },

    mouseHandler: function (e) {

        console.log(e.type);


        mouse_xpos = e.clientX - canvas.getBoundingClientRect().left;
        mouse_ypos = e.clientY - canvas.getBoundingClientRect().top;

        x_offset = mouse_xpos - id_xpos;
        y_offset = mouse_ypos - id_ypos;

        var img_data_index_x = Math.floor(x_offset / id_scale_factor);
        var img_data_index_y = Math.floor(y_offset / id_scale_factor);

        switch (e.type) {

            // Mouse moves over the element
            case "mousemove":

                if (is_mouse_down && (mouse_state == cursor_states.SELECT)) {

                    id_xpos += (mouse_xpos - previous_mouse_x);
                    id_ypos += (mouse_ypos - previous_mouse_ypos);
                }

                if (is_mouse_down && (mouse_state == cursor_states.PAINT)) {

                    this.modifyImageData(img_data_index_x, img_data_index_y, red, green, blue, alpha);
                }

                if (is_mouse_down && (mouse_state == cursor_states.ERASE)) {
                    this.modifyImageData(img_data_index_x, img_data_index_y, 0, 0, 0, 0);
                }

                break;

            // Mouse is pressed down on the element
            case "mousedown":

                is_mouse_down = true;

                switch (mouse_state) {

                    case cursor_states.SELECT:


                        break;

                    case cursor_states.PAINT:


                        this.modifyImageData(img_data_index_x, img_data_index_y, red, green, blue, alpha);

                        break;

                    case cursor_states.ERASE:

                        this.modifyImageData(img_data_index_x, img_data_index_y, 0, 0, 0, 0);

                        break;

                }

                //document.getElementById("mousePos").innerHTML = mouse_xpos + " " + mouse_ypos
                + " " + x_offset + " " + y_offset + " " + id_xpos + " " + id_ypos;
                break;

            // Mouse is released over the element
            case "mouseup":
                is_mouse_down = false;
                break;

            // Mouse wheel is scrolled over the element
            case "wheel":

                // TODO: its scrolls in and out from the image's top left corner, scroll in and out based on current mouse position
                console.log("wheel scrolled")

                // This increases or decreases the size of the image by 15 precent every tick of the scroll wheel for a better zoom
                id_scale_factor *= (1 - (.15 * Math.sign(e.deltaY)));
                id_scale_factor = Math.min(200, Math.max(5, id_scale_factor));

                break;
        }

        previous_mouse_x = mouse_xpos;
        previous_mouse_ypos = mouse_ypos;

        this.draw();
    }
};

document.getElementById("mousePos").innerHTML = " test";
CanvasViewport.init("CV");

document.getElementById("select_button").addEventListener("click", function () {
    //document.getElementById("mousePos").innerHTML = "select clicked";
    CanvasViewport.changeMouseState(cursor_states.SELECT);
});

document.getElementById("paint_button").addEventListener("click", function () {
    //document.getElementById("mousePos").innerHTML = "paint clicked";
    CanvasViewport.changeMouseState(cursor_states.PAINT);
});

document.getElementById("erase_button").addEventListener("click", function () {
    //document.getElementById("mousePos").innerHTML = "erase clicked";
    CanvasViewport.changeMouseState(cursor_states.ERASE);
});

document.getElementById("red").addEventListener("change", function () {
    red = document.getElementById("red").value;
    updateColorSelectCanvas();
});

document.getElementById("green").addEventListener("change", function () {
    green = document.getElementById("green").value;
    updateColorSelectCanvas();
});

document.getElementById("blue").addEventListener("change", function () {
    blue = document.getElementById("blue").value;
    updateColorSelectCanvas();
});

CanvasViewport.draw();
updateColorSelectCanvas();

/**
 * This function passes along the mouse events from the html canvas to the CanvasViewport singleton to handle. The html canvas couldn't send the events directly to
 * the CanvasViewport because... <-- Not sure about this tried many different things
 * 
 * @param {*} e The mouse event that is sent from the html canvas
 */
function mouseHandler(e) {
    CanvasViewport.mouseHandler(e);
}

function resizeHandler(w, h){
    CanvasViewport.resizeImage(w, h);
}

function updateColorSelectCanvas() {

    scc_ctx = document.getElementById("selectedColorCanvas").getContext("2d");
    scc_ctx.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    scc_ctx.fillRect(0, 0, 32, 32);

}