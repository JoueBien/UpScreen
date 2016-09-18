templatesForExport = {
    "LayersNames": [],
    "LayersData":[],
    "SlidesNames":[],
    "SlidesData":[],
}

templatesForExport.SlidesNames.push("Defoult New Slide.pts");

templatesForExport.SlidesData.push(
    {
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
    }
);
templatesForExport.LayersNames.push("Defoult New Layer.ptl");
templatesForExport.LayersData.push(
    {
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
    }
);

//new slide defoult jason
templatesForExport.LayersNames.push("Defoult Layer Title.ptl");
templatesForExport.LayersData.push(
    {
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
    }
);


templatesForExport.LayersNames.push("Defoult Layer TextBox.ptl");
templatesForExport.LayersData.push(
{
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
    }
);
exports.data = templatesForExport;
