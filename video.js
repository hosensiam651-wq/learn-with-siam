const video =
document.getElementById("courseVideo");

const progress =
document.getElementById("videoProgress");

video.addEventListener("timeupdate",function(){

let percent =
(video.currentTime /
video.duration) * 100;

if(!isNaN(percent)){

progress.value = percent;

}

});
