class UISelectionGrid{
    
    constructor(){
        this.allowMultiple = false;
        this.squares = [];

        this.anchor_div = null;
        this.active_div = document.createElement("div");
        this.flexbox_div = document.createElement("div");
        this.flexbox_div.className = "ui_square_flexbox";

        this.boundOnActiveClick = this.onActiveClick.bind(this);
        this.active_div.onclick = this.boundOnActiveClick;

        this.is_shown = false;
    }

    onActiveClick(){

        if(this.is_shown) this.hide();
        else this.show();

    }

    show(){
        this.flexbox_div.style.display = "flex";
        this.is_shown = true;
    }

    hide(){
        this.flexbox_div.style.display = "none";
        this.is_shown = false;
    }

    addSquare(sq){
        this.squares.push(sq);
        sq.parent_grid = this;
    }

    setAnchorDiv(div){
        this.anchor_div = div;
    }

    handleActivatedSquare(sq){

        if(this.allowMultiple) return;

        for(let i = 0; i < this.squares.length; i++){
            //TEST: might be able to directly check if it is equal to sq
            if(this.squares[i].DOMelement.id != sq.DOMelement.id){
                this.squares[i].setInactive();
            }
        }


        // When you only allow one selection this will close the grid when one is picked, might not want this
        this.hide();
        this.setActiveSVG(sq.svg_text);

    }

    // This is not very sound, not sure of the best way to do this
    setActiveSVG(svg_text){
        let x = this.active_div.getElementsByTagName("svg");
        if(x.length != 0){
            this.active_div.removeChild(this.active_div.getElementsByTagName("svg")[0]);
        }

        if(svg_text != null){
            this.active_div.insertAdjacentHTML('beforeend', svg_text);
        }
    }

    // This can only be called once TODO fix
    // Maybe call it addToDom or something
    render(){

        for(let i = 0; i < this.squares.length; i++){
            this.flexbox_div.appendChild(this.squares[i].DOMelement);
        }

        // Need to check if squares is empty, but also can't assume that squares[0] starts as active, need
        // a better way to initialize the svg in the active square
        if(!this.allowMultiple){
            this.setActiveSVG(this.squares[0].svg_text)
        }
        this.active_div.className = "activeSquare";

        this.anchor_div.appendChild(this.active_div);
        this.anchor_div.appendChild(this.flexbox_div);
    }

}

class UISquare{

    constructor(id){

        this.active = false;
        //this.DOMelement = e;
        this.DOMelement = document.createElement("div");
        this.DOMelement.setAttribute("id", id);
        this.DOMelement.className = "unselectedSquare";
        this.boundToggle = this.toggle.bind(this);
        this.DOMelement.onclick = this.boundToggle;

        this.svg_text = null;

        this.parent_grid = null;

        this.activeFunction = null;
        this.inactiveFunction = null;

        this.functionArgs = null;

    }

    toggle(){


        if(!this.active){
            this.setActive();
            this.parent_grid.handleActivatedSquare(this);
        }

        else if(this.active){
            this.setInactive();
        }
    }

    setActive(){
        this.active = true;
        //e.currentTarget.classList.remove("unselectedSquare");
        //e.currentTarget.classList.add("selectedSquare");
        this.DOMelement.classList.remove("unselectedSquare");
        this.DOMelement.classList.add("selectedSquare");

        if(this.activeFunction != null){
            this.activeFunction(...this.functionArgs);
        }
    }

    setInactive(){
        this.active = false;
        //e.currentTarget.classList.remove("selectedSquare");
        //e.currentTarget.classList.add("unselectedSquare");
        this.DOMelement.classList.add("unselectedSquare");
        this.DOMelement.classList.remove("selectedSquare");

        if(this.inactiveFunction != null){
            this.inactiveFunction(...this.functionArgs);
        }
    }

    setParentGrid(g){
        this.parent_grid = g;
    }

    // Goal of this is to set the svg icon for now
    addHTML(text){
        this.DOMelement.insertAdjacentHTML('beforeend',text);
        this.svg_text = text;
    }

    setActiveFunction(f){
        this.activeFunction = f;
    }

    setInactiveFunction(f){
        this.inactiveFunction = f;
    }

    setFunctionArgs(args){
        this.functionArgs = args;
    }

    /*
    performFunction(args){
        this.function(...args);
    }*/
}


//testing

// SVG icons from tablericons.com
//let ui_circle_cursor_square = new UISquare(document.getElementById("cursor_circle_test"));
let ui_square_cursor_circle = new UISquare("ui-square-cursor-circle");
ui_square_cursor_circle.addHTML
('<svg width="64" height="64" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none"' +
'stroke-linecap="round" stroke-linejoin="round">' +
'<path stroke="none" d="M0 0h24v24H0z" fill="none" /> <circle cx="12" cy="12" r="9" /> </svg>');

ui_square_cursor_circle.setActiveFunction((cursor) =>{
    cursor.setData(geometryCreator.createCircle(1, 16));
});
ui_square_cursor_circle.setFunctionArgs([C]);


let ui_square_cursor_star = new UISquare("ui-square-cursor-star");
ui_square_cursor_star.addHTML(
    '<svg width="64" height="64" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none"' +
    'stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z" fill="none" />' +
    '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" /> </svg>'
);
ui_square_cursor_star.setActiveFunction((cursor) =>{
    cursor.setData(geometryCreator.createStar(1.5, 10));
});
ui_square_cursor_star.setFunctionArgs([C]);

let ui_square_cursor_random = new UISquare("ui-square-cursor-random");
ui_square_cursor_random.addHTML(
    '<svg width="64" height="64" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none"' +
    'stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z" fill="none" />' +
    '<path d="M8 8a3.5 3 0 0 1 3.5 -3h1a3.5 3 0 0 1 3.5 3a3 3 0 0 1 -2 3a3 4 0 0 0 -2 4" />' +
    '<line x1="12" y1="19" x2="12" y2="19.01" /> </svg>'
);
ui_square_cursor_random.setActiveFunction((cursor) =>{
    cursor.setData(geometryCreator.createRandomCursor(2, 10));
});
ui_square_cursor_random.setFunctionArgs([C]);

let blank1 = new UISquare("blank1");
let blank2 = new UISquare("blank2");
let blank3 = new UISquare("blank3");
let blank4 = new UISquare("blank4");
let blank5 = new UISquare("blank5");
let blank6 = new UISquare("blank6");
let blank7 = new UISquare("blank7");
let blank8 = new UISquare("blank8");
let blank9 = new UISquare("blank9");
let blank10 = new UISquare("blank10");


let cursor_ui_flexbox = new UISelectionGrid();
cursor_ui_flexbox.addSquare(ui_square_cursor_circle);
cursor_ui_flexbox.addSquare(ui_square_cursor_star);
cursor_ui_flexbox.addSquare(ui_square_cursor_random);

cursor_ui_flexbox.addSquare(blank1);
cursor_ui_flexbox.addSquare(blank2);
cursor_ui_flexbox.addSquare(blank3);
cursor_ui_flexbox.addSquare(blank4);
cursor_ui_flexbox.addSquare(blank5);
cursor_ui_flexbox.addSquare(blank6);
cursor_ui_flexbox.addSquare(blank7);
cursor_ui_flexbox.addSquare(blank8);
cursor_ui_flexbox.addSquare(blank9);
cursor_ui_flexbox.addSquare(blank10);



cursor_ui_flexbox.setAnchorDiv(document.getElementById("ui_cursor_anchor"));
cursor_ui_flexbox.render();



let function_ui_flexbox = new UISelectionGrid();
function_ui_flexbox.allowMultiple = true;
function_ui_flexbox.setActiveSVG(
    '<svg width="64" height="64" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
  '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>' +
  '<path d="M14 10h1c1 0 1 1 2.016 3.527c.984 2.473 .984 3.473 1.984 3.473h1" />' +
  '<path d="M13 17c1.5 0 3 -2 4 -3.5s2.5 -3.5 4 -3.5" />' +
  '<path d="M3 19c0 1.5 .5 2 2 2s2 -4 3 -9s1.5 -9 3 -9s2 .5 2 2" />' +
  '<line x1="5" y1="12" x2="11" y2="12" /> </svg>'
);

let ui_square_function_sculpt = new UISquare();
ui_square_function_sculpt.addHTML(
'<svg width="64" height="64" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
  '<path stroke="none" d="M0 0h24v24H0z" fill="none"/> <path d="M12 13v-8l-3 3m6 0l-3 -3" />' +
  '<line x1="9" y1="17" x2="10" y2="17" /><line x1="14" y1="17" x2="15" y2="17" /><line x1="19" y1="17" x2="20" y2="17" /><line x1="4" y1="17" x2="5" y2="17" /></svg>'
);

// These are placeholders and are basically hardcoded, but I just want to get the UI functionality set for now
ui_square_function_sculpt.setActiveFunction((mesh) => {
    mesh.sculpt = true;
});
ui_square_function_sculpt.setInactiveFunction((mesh) =>{
    mesh.sculpt = false;
});
ui_square_function_sculpt.setFunctionArgs([S]);
// This is just to have one function active when the page is loaded
ui_square_function_sculpt.setActive();

let ui_square_function_color = new UISquare();
ui_square_function_color.addHTML(
'<svg width="64" height="64" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
'<path stroke="none" d="M0 0h24v24H0z" fill="none"/> <path d="M3 21v-4a4 4 0 1 1 4 4h-4" />' +
'<path d="M21 3a16 16 0 0 0 -12.8 10.2" /> <path d="M21 3a16 16 0 0 1 -10.2 12.8" />' +
'<path d="M10.6 9a9 9 0 0 1 4.4 4.4" /> </svg>'
);

ui_square_function_color.setActiveFunction((mesh) => {
    mesh.color = true;
});
ui_square_function_color.setInactiveFunction((mesh) =>{
    mesh.color = false;
});
ui_square_function_color.setFunctionArgs([S]);

function_ui_flexbox.addSquare(ui_square_function_sculpt);
function_ui_flexbox.addSquare(ui_square_function_color);

function_ui_flexbox.setAnchorDiv(document.getElementById("ui_function_anchor"));
function_ui_flexbox.render();
