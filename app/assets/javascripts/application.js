// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery-ui
//= require id3v2
//= require jrotate


var no_deck = '1';
var deck1_rotating = false;
var deck2_rotating = false;
var stop_deck1 = false;
var stop_deck2 = false;
var set_deck1 = false;
var set_deck2 = false;
var angle1 = 0;
var angle2 = 0;
var angle3 = 0;
var angle4 = 0;

function parseFile(file, callback){
  if(localStorage[file.name]) return callback(JSON.parse(localStorage[file.name]));
  ID3v2.parseFile(file,function(tags){
    //to not overflow localstorage
    localStorage[file.name] = JSON.stringify({
      Title: tags.Title,
      Artist: tags.Artist,
      Album: tags.Album,
      Genre: tags.Genre
    });
    callback(tags);
  })
}

function runSearch(query){
  var regex = new RegExp(query.trim().replace(/\s+/g, '.*'), 'ig');
  for(var i = $('songtable').getElementsByTagName('tr'), l = i.length; l--;){
    if(regex.test(i[l].innerHTML)){
      i[l].className = 'visible'
    }else{
      i[l].className = 'hidden';
    }
  }
}

function canPlay(type){
  var a = document.createElement('audio');
  return !!(a.canPlayType && a.canPlayType(type).replace(/no/, ''));
}

function $(id){return document.getElementById(id)}
function getSongs(files){
  var queue = [];
  var mp3 = canPlay('audio/mpeg;'), ogg = canPlay('audio/ogg; codecs="vorbis"');
  for(var i = 0; i < files.length; i++){
    var file = files[i];

    var path = file.webkitRelativePath || file.mozFullPath || file.name;
    if (path.indexOf('.AppleDouble') != -1) {
      // Meta-data folder on Apple file systems, skip
      continue;
    }         
    var size = file.size || file.fileSize || 4096;
    if(size < 4095) { 
      // Most probably not a real MP3
      continue;
    }

    if(file.name.indexOf('mp3') != -1){ //only does mp3 for now
      if(mp3){
        queue.push(file);
      }
    }
    if(file.name.indexOf('ogg') != -1  || file.name.indexOf('oga') != -1){
      if(ogg){
        queue.push(file);
      }
    }
  }

  //This section print the fily list
  var process = function(){
    if(queue.length){

      var f = queue.shift();
      parseFile(f,function(tags){
        var tr = document.createElement('tr');
        var t2 = guessSong(f.webkitRelativePath || f.mozFullPath || f.name); 
        //it should be innerText/contentText but its annoying.
        var td = document.createElement('td');
        td.innerHTML = tags.Title || t2.Title;
        tr.appendChild(td);

        var td = document.createElement('td');
        td.innerHTML = tags.Artist || t2.Artist;
        tr.appendChild(td);

        //Between this marks is the code to make to tables of songs
        tr.onclick = function(){
          var div = document.getElementById('song_deck' + no_deck );
          div.innerHTML = tags.Title || t2.Title;
          var url;
          if(window.createObjectURL){
            url = window.createObjectURL(f)
          }else if(window.createBlobURL){
            url = window.createBlobURL(f)
          }else if(window.URL && window.URL.createObjectURL){
            url = window.URL.createObjectURL(f)
          }else if(window.webkitURL && window.webkitURL.createObjectURL){
            url = window.webkitURL.createObjectURL(f)
          }

          if(no_deck == 1)
            set_deck1 = true;
          else
            set_deck2 = true;

          angle3 = 45;
          angle4 = 45;
          deckRotate(no_deck);
          needleRotate(no_deck);
          $("player" + no_deck).volume=0.5;
          $("player" + no_deck).src = url;
          $("player" + no_deck).play();
          for(var i = document.querySelectorAll('.playing'), l = i.length; l--;){
            i[l].className = '';
          }
        }
        ////////////////////////////////////////////////////
        $('songtable').appendChild(tr);
        process();
      })
      var lq = queue.length;
      setTimeout(function(){
        if(queue.length == lq){
          process();
        }
      },300);
    }
  }
  process();

}

var currentSong = 0;

function play(deck){
  if(deck == 1 && set_deck1 == true){
    deck1_rotating = false;
    stop_deck1 = false;
    angle3 = 45;
    $("player" + deck).play();
    deckRotate(deck);
    needleRotate(deck);
  }
  if(deck == 2 && set_deck2 == true){
    deck2_rotating = false;
    stop_deck2 = false;
    angle4 = 45;
    $("player" + deck).play();
    deckRotate(deck);
    needleRotate(deck);
  }
}

function pause(deck){
  if(deck == 1 && set_deck1 == true){
    angle3 = 0;
    stop_deck1 = true;
    $("player" + deck).pause();
    needleRotate(deck);
  }
  if(deck == 2 && set_deck2 == true){
    angle4 = 0;
    stop_deck2 = true;
    $("player" + deck).pause();
    needleRotate(deck);
  }
}

function deck1(){
  no_deck = '1';
  document.getElementById('deck1_button').style.background = "#a2a2a2";
  document.getElementById('deck2_button').style.background = "#bcbcbc";
}

function deck2(){
  no_deck = '2';
  document.getElementById('deck1_button').style.background = "#bcbcbc";
  document.getElementById('deck2_button').style.background = "#a2a2a2";
}

onload = function(){

  document.getElementById('deck1_button').style.background = "#a2a2a2";

  //with no dependencies, it should be fine to use this instead of ondomcontentloaded
  var a = document.createElement('audio');
  if(!a.canPlayType) $("support").innerHTML += "Your browser does not support HTML5 Audio<br>";
  if(!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''))) 
  $("support").innerHTML += "Your browser does not support Ogg Vorbis Playback<br>";
  if(!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''))) 
  $("support").innerHTML += "Your browser does not support MP3 Playback<br>";
  var f = document.createElement('input');
  f.type = 'file';
  if(!('multiple' in f)) $("support").innerHTML += "Your browser does not support selecting multiple files<br>";
  if(!('webkitdirectory' in f)) $("support").innerHTML += "Your browser probably does not support selecting directories<br>";
  if(window.createObjectURL){}else if(window.createBlobURL){}else if(window.URL && window.URL.createObjectURL){
  }else if(window.webkitURL && window.webkitURL.createObjectURL){}else{
    $("support").innerHTML += "Your browser probably does not support Object URLs<br>";
  }

  document.querySelector('#search input').onkeydown = function(e){
    if(e.keyCode == 13){
      for(var i = document.querySelectorAll('#songtable tr.visible'), l = i.length; l--;){
        i[l].onclick();
      }
    }
  }
}

//JRotate

function deckRotate(deck){
  if(deck == 1 ){
    if(!deck1_rotating){
      var rotating1 = setInterval(function(){
        angle1+=5;
        jQuery("#turntable_" + deck).rotate(angle1);
        if(stop_deck1)
          clearInterval(rotating1);
      },50);
      deck1_rotating = true;
    }
  }else{
    if(!deck2_rotating){
      var rotating2 = setInterval(function(){
        angle2+=5;
        jQuery("#turntable_" + deck).rotate(angle2);
        if(stop_deck2)
          clearInterval(rotating2);
      },50);
      deck2_rotating = true;
    }
  }
}

function needleRotate(deck){
  if(deck == 1 ){
    jQuery("#needle_" + deck).rotate({ animateTo:angle3})
  }else{
    jQuery("#needle_" + deck).rotate({ animateTo:angle4})
  }
}
