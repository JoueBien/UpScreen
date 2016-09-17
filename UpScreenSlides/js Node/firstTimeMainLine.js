//libary
var electron = require('electron');
var fs = require('fs');
var app = electron.app;
const dataTemplates = require('./DataStructures.js');

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
exports.dataTemplates = dataTemplates;
//add to global to assists saving

//creat folders if they don't exits
fs.exists(fileStorage, function(exists) {
    if (!exists) {
        fs.mkdir(fileStorage);
        fs.mkdir(templates, function (err) {
            if (!err) {
                fs.mkdir(templateSlides);
                fs.mkdir(templateSlideLayer);
            }
        });
        fs.mkdir(media, function (err) {
            if (!err) {
                fs.mkdir(mediaVideos);
                fs.mkdir(mediaImages);
                //write templates to file
                //slides
                fs.writeFile(templateSlides+"/Defoult New Slide.pts", JSON.stringify(dataTemplates.defoultNewSlide), function (err) {
                    if(err){ console.log("An error ocurred creating the file "+ err.message); }
                    console.log("The file has been succesfully saved");
                });
                //layers
                fs.writeFile(templateSlideLayer+"/Defoult New Layer.ptl", JSON.stringify(dataTemplates.defoultNewLayer), function (err) {
                    if(err){ console.log("An error ocurred creating the file "+ err.message); }
                    console.log("The file has been succesfully saved");
                });
                fs.writeFile(templateSlideLayer+"/Defoult Layer Title.ptl", JSON.stringify(dataTemplates.defoultLayerTitle), function (err) {
                    if(err){ console.log("An error ocurred creating the file "+ err.message); }
                    console.log("The file has been succesfully saved");
                });
                fs.writeFile(templateSlideLayer+"/Defoult Layer TextBox.ptl", JSON.stringify(dataTemplates.defoultLayerTextBox), function (err) {
                    if(err){ console.log("An error ocurred creating the file "+ err.message); }
                    console.log("The file has been succesfully saved");
                });

            }
        });




    }
});
