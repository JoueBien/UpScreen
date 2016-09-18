//libary
var electron = require('electron');
var fs = require('fs');
var app = electron.app;
global.dataTemplates = require('./DataStructures.js').data;
//console.log(dataTemplates);
//generate folders
folders = app.getPath('userData');
fileStorage = folders.replace("Up-Screen-Slides", "UpScreen");   //change app folder to a shared one
templates = fileStorage + "/templates";
templateSlideLayer = templates + "/layers"; // projection template layers
templateSlides = templates + "/slides"; //projection template slides
media = fileStorage + "/media";
mediaVideos = media + "/mediaVideos";
mediaImages = media + "/mediaImages";
//export to global
exports.fileStorage = fileStorage;
exports.templates = templates;
exports.templateSlideParts = templateSlideLayer;
exports.templateSlides = templateSlides;
exports.media = media;
exports.mediaVideos = mediaVideos;
exports.mediaImages = mediaImages;

//add to global to assists saving
//not found then create

if (!fs.existsSync(fileStorage)){
    fs.mkdirSync(fileStorage);
        fs.mkdirSync(templates);
            fs.mkdirSync(templateSlideLayer);
                //global.dataTemplates.SlidesNames[0]
                fs.writeFileSync(templateSlideLayer+"/"+global.dataTemplates.LayersNames[0],JSON.stringify(global.dataTemplates.LayersData[0]));
                fs.writeFileSync(templateSlideLayer+"/"+global.dataTemplates.LayersNames[1],JSON.stringify(global.dataTemplates.LayersData[1]));
                fs.writeFileSync(templateSlideLayer+"/"+global.dataTemplates.LayersNames[2],JSON.stringify(global.dataTemplates.LayersData[2]));
            fs.mkdirSync(templateSlides);
            fs.writeFileSync(templateSlides+"/"+global.dataTemplates.SlidesNames[0],JSON.stringify(global.dataTemplates.SlidesData[0]));
        fs.mkdirSync(media);
            fs.mkdirSync(mediaVideos);
            fs.mkdirSync(mediaImages);
}
//load in from file
    //resset jason
    global.dataTemplates = {
        "LayersNames": [],
        "LayersData":[],
        "SlidesNames":[],
        "SlidesData":[],
    };
    //get list of layer templates
    templatesFileList = fs.readdirSync(templateSlideLayer+"/");
    templatesFileList.forEach(function (fileName) {
        //console.log(fileName);
        data = fs.readFileSync(templateSlideLayer+"/"+fileName,"utf8");
        jData = JSON.parse(data);
        global.dataTemplates.LayersNames.push(fileName);
        global.dataTemplates.LayersData.push(jData);
        //console.log(jData);
    });
    //get list of slide templates
    templatesFileList = fs.readdirSync(templateSlides+"/");
    templatesFileList.forEach(function (fileName) {
        //console.log(fileName);
        data = fs.readFileSync(templateSlides+"/"+fileName,"utf8");
        jData = JSON.parse(data);
        global.dataTemplates.SlidesNames.push(fileName);
        global.dataTemplates.SlidesData.push(jData);
        //console.log(jData);
    });
//return templates to caller file
exports.templatesData = global.dataTemplates;
