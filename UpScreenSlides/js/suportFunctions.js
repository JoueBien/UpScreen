const remote = require('electron');
const ipcRenderer = require('electron').ipcRenderer;


var defoultNewSlide = {
    "background" : {
        "type" : "color",
        "data" : "black"
    },
    "slide" : {
        "number" : 0,
        "displayName" : "demoSlide",
        "displayNumber" : 0,
        "notes" : "no notes",
    },
    "innerSlideParts": [],
};

var defoultNewSLayer = {
    "text" : {
        "text" : "",
        "afterText" : "",
        "textSize" : 5,
        "textColour" : "black",
        "textFont" : "",
        "textAlign" : "left"
    },
    "background" : {
        "type" : "colour",
        "data" : "white",
    },
    "innerSlideParts" : [],
    "x" : 0,
    "y" : 0,
    "width" : 0,
    "height" : 0,
    "opacity" : 0,
    "padding" : 0,
    "shape" : "square",
    "borderRadius" : 0,

    "outline" :{
        "size" : 0,
        "colour": "black",
        "style" : "solid",

    }
};

//new slide defoult jason
var defoultLayerTitle = {
    "text" : {
        "text" : "Title",
        "afterText" : "",
        "textSize" : 517,
        "textColour" : "black",
        "textFont" : "",
        "textAlign" : "center"
    },
    "background" : {
        "type" : "colour",
        "data" : "white",
    },
    "innerSlideParts" : [],
    "x" : 3,
    "y" : 5,
    "width" : 94,
    "height" : 15,
    "opacity" : 0,
    "padding" : 0,
    "shape" : "square",
    "borderRadius" : 0,

    "outline" :{
        "size" : 0,
        "colour": "black",
        "style" : "solid",

    }
};

var defoultLayerTextBox = {
    "text" : {
        "text" : "Text Box",
        "afterText" : "",
        "textSize" : 337,
        "textColour" : "black",
        "textFont" : "",
        "textAlign" : "left"
    },
    "background" : {
        "type" : "colour",
        "data" : "white",
    },
    "innerSlideParts" : [],
    "x" : 3,
    "y" : 25,
    "width" : 94,
    "height" : 70,
    "opacity" : 0,
    "padding" : 1,
    "shape" : "square",
    "borderRadius" : 0,

    "outline" :{
        "size" : 0,
        "colour": "black",
        "style" : "solid",

    }
};
//html secape function
function stripTags (html){
        return escape(html);

}

//renders the css used in the slide preview
function generateCSS (sPart,position){
    style=" style='position:"+position+"; ";
    if (sPart.width != -1){
        style+=" width :"+sPart.width+"%; ";
    }
    if (sPart.height != -1){
        style+=" height :"+sPart.height+"%; ";
    }
    if (sPart.text.textColour != -1){
        style+= " color: "+sPart.text.textColour+"; ";
    }
    if (sPart.text.textSize != -1){
        style += " font-size: "+sPart.text.textSize+"%;";
    }
    if (sPart.padding != -1){
        style+=" padding: "+sPart.padding+"%;";
        style+=" padding-left: "+(sPart.padding *2)+"%;";
        style+=" padding-right: "+(sPart.padding *2)+"%;";

    }
    if (sPart.borderRadius != -1){
        style+=" border-radius: "+sPart.borderRadius+"vh;";
    }
    if (sPart.outline.size > 0){
        style+= " border: "+sPart.outline.style+" "+ sPart.outline.colour+" "+sPart.outline.size +"vh;"
    }
    //text aligh
    if (sPart.text.textAlign != -1){
        style+=" text-align: "+sPart.text.textAlign+";";
    }
    if (sPart.opacity >-1 && sPart.opacity<101){
        style+=" opacity: "+(100/sPart.opacity-1)+";";
    }
    //position
    style+=" top: "+sPart.y+"%;";
    style+=" left: "+sPart.x+"%;";
    switch (sPart.background.type) {
        case "colour":
            style+=" background-color:"+sPart.background.data+"; ";
            break;
        case "image":
            style+= ' background-image: url("'+sPart.background.data+'"); background-size: contain;';
            break;
        default:break;
    }

    style+="' ";

    console.log(style);
    return style;
}

//triggers the export function
function saveAs (){
    ipcRenderer.on("fileSystem", (event, arg) => {
        console.log(arg);  // prints "ping"
    });
    ipcRenderer.send("fileSystem",{
        "type":"saveAs",
        "data": slides,
    });
}



//switch from background to layers/slides side menu to settings side menu
function changeToBackgroundMenu (){
    $("#slidesAndLayersMenu").hide();
    $("#SettingsMenu").hide();
    document.getElementById("sideMenuTitle").innerHTML = "Background";
    $("#backgroundsMenu").show();
}
function changeToSlidesAndLayersMenu (){
    $("#backgroundsMenu").hide();
    $("#SettingsMenu").hide();
    document.getElementById("sideMenuTitle").innerHTML = "Slides & Layers";
    $("#slidesAndLayersMenu").show();
}

function changeToSettingsMenu (){
    $("#slidesAndLayersMenu").hide();
    $("#backgroundsMenu").hide();
    document.getElementById("sideMenuTitle").innerHTML = "Settings";
    $("#SettingsMenu").show();

}
