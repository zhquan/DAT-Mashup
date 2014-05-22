$(document).ready(function(){
    $("#tabs").tabs();
    getLocation();
    function getLocation(){
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(showPosition);
        }else{
            $("#geo").append("Geolocation is not supported by this browser");
        }
    }
    function showPosition(position){
        $("#home").append('<div id="weather" title="WEATHER"></div><button id="tiempo" onclick=weather(\''+position.coords.latitude+','+ position.coords.longitude+'\')>Weather</button>');
        $("#weather").dialog({
            autoOpen: false,
            show: {
                effect: "blind",
                duration: 1000
            },
            hide: {
                effect: "explode",
                duration: 100
            }
        });
        var yo = L.map('geo').setView([position.coords.latitude, position.coords.longitude], 14);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(yo);
        var circle = L.circle([position.coords.latitude, position.coords.longitude], 100,{
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.6 
        }).addTo(yo);
        L.marker([position.coords.latitude, position.coords.longitude]).addTo(yo)
            .bindPopup("you are here")
            .openPopup();
    }

    // plugin de galeria    
    var galleryOpt =  {
        enabled: false,
        preload: [0,2],
        navigateByImgClick: true,
        arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
        tPrev: 'Previous (Left arrow key)',
        tNext: 'Next (Right arrow key)',
        tCounter: '<span class="mfp-counter">%curr% of %total%</span>'
	}

    $("#icono img").click(function() {
        $("#icono").toggle( "puff", 500);
        $("#formulario").toggle("puff", 500);
    });

    if (localStorage.length > 0){
        var objeto = JSON.parse(localStorage.getItem('user'));
        for (i=0; i<objeto.length; i++){
            userNuevo(objeto[i].user, objeto[i].id, objeto[i].image, objeto[i].comentario);
        }
    }
    
    $("#enviar").click(function() {
        var user = document.getElementById("UserId").value;
        buscar(user);
    });
});
var map;
var id_latlng = [];
function weather(latlng){
        $("#weather").dialog( "open" );
        var NominatimAPI = 'http://nominatim.openstreetmap.org/reverse?json_callback=?';
        $.getJSON( NominatimAPI, {
            lat: latlng.split(',')[0],
            lon: latlng.split(',')[1],
            addressdetails: 1,
            format: "json"
        })
        .done(function( data ) {
            console.log('dato: '+data.display_name);
            $.simpleWeather({
                location: data.display_name,
                woeid: '',
                unit: 'c',
                success: function(weather) {
                    console.log(weather);
                    html = '<img src="'+weather.image+'">';
                    html += '<h2>'+weather.temp+'&deg;'+weather.units.temp+'</h2>';
                    html += weather.city+', '+weather.country+'<br>';
                    html += weather.currently+'<br>';
                    html += weather.wind.direction+' '+weather.wind.speed+' '+weather.units.speed;

                    $("#weather").html(html);
                },
                error: function(error) {
                    $("#weather").html('<p>'+error+'</p>');
                }
            });
        })
    }
function buscar(user){
    gapi.client.load('plus', 'v1', function() {
        var request = gapi.client.plus.people.get({
            'userId': user
            // '105313830640377595865'
            // '108086881826934773478'
            // '103846222472267112072'
        });
        request.execute(function(resp) {
            if (resp.displayName != undefined){
                if (localStorage.length>0){
                    var array = JSON.parse(localStorage.getItem('user'));
                }else{
                    var array = [];
                }
                var objeto = {'id': user, 'user': resp.displayName, 'image': resp.image.url.split(".jpg")[0]+".jpg"};
                array.push(objeto);
                localStorage.setItem('user', JSON.stringify(array));
                userNuevo(resp.displayName, user, resp.image.url.split(".jpg")[0]+".jpg");
            }else{
                alert('userId: '+user+' no exist');
            }
        });
    });

    $("#formulario").toggle("puff", 500);
    $("#icono").toggle( "puff", 500);
}

function userNuevo(name, userid, imagen, comentario){
    if (!$("#"+userid).length){
        addUser(name, userid, imagen);
        $("#cborrar"+name.split(" ")[0]).click(function(){
            $("#cambio"+name.split(" ")[0]).remove();
            $("#"+name.split(" ")[0]).remove();
        });
        $("#borrar"+name.split(" ")[0]).click(function(){
            $("#cambio"+name.split(" ")[0]).remove();
            $("#"+name.split(" ")[0]).remove();
        });
    }
    $("#users2").scroll();
}
function addUser(nombre, userid, imagen){
    $("#users").append($('<div id="h'+userid+'" onclick="clickUserHome(\''+userid+','+nombre+'\')" class="perfil"><img onmouseover="mostrar(\'b'+userid+'\')" src='+imagen+".jpg width='80' height='80'/><h4>"+nombre+'</h4><button id="b'+userid+'" onclick=borrar(\''+userid+'\') style="display:none">Borrar</button></div>'));
    
    $("#users2").append($('<div id="'+userid+'" onclick="clickPerfil(\''+userid+','+nombre+'\')" class="perfil"><img onmouseover="mostrar(\'b2'+userid+'\')" src='+imagen+".jpg width='80' height='80'/><h4>"+nombre+'</h4><button id="b2'+userid+'" onclick=borrar(\''+userid+'\') style="display:none">Borrar</button></div>'));
}

function mostrar(x){
    $("#"+x).show();
}

function borrar(user){
    var objeto = JSON.parse(localStorage.getItem('user'));
    for (i=0;i<objeto.length;i++){
        if (objeto[i].id == user){
            objeto.splice(i, 1);
        }
    }
    localStorage.setItem('user', JSON.stringify(objeto));
    $("#"+user).remove();
    $("#h"+user).remove();
}

function clickUserHome(nombre){
    $("#home").hide();
    $("#usuarios").show();
    clickPerfil(nombre);
}

function clickPerfil(x){
    $('#images').empty();
    $('#map').remove();
    $('#mapa').append('<div id="map"></div>');
    $("#comentario").empty();
    var usuario = x.split(",")[0];
    var nombre = x.split(",")[1];
    $("#comentarios h1").html(nombre);
    // MAPA
    map = L.map('map').setView([40.2838, -3.8215], 2);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    gapi.client.load('plus', 'v1', function() {
        var request = gapi.client.plus.activities.list({
            'userId': usuario
        });
        request.execute(function(resp) {
            for (i=0;i<resp.items.length;i++) {
                if (resp.items[i]['location'] != undefined) {
                    var latitud = resp.items[i].location.position.latitude;
                    var longitud = resp.items[i].location.position.longitude;
                    
                    mark = L.marker([latitud, longitud]).addTo(map);
                    mark.on('click', marcar);
                    addComent(i, resp);
                }else{
                    $("#comentario").append($("<div class='descripcion'><p><h4>"+resp.items[i].title+"</h4></p></div>"));
                }
            }
            $("#comentario").append('<button onclick="deleteMark()">Remove All Marks</button>');
            $("#comentario").scroll();
            $("#images").scroll();
        });
    });
}

function marcar(x){
    var NominatimAPI = 'http://nominatim.openstreetmap.org/reverse?json_callback=?';
    $.getJSON( NominatimAPI, {
        lat: x.latlng.lat,
        lon: x.latlng.lng,
        addressdetails: 1,
        format: "json"
    })
    .done(function( data ) {
        L.marker([x.latlng.lat, x.latlng.lng]).addTo(map)
            .bindPopup(data.display_name+'<br>'+x.latlng.lat+'<br>'+x.latlng.lng)
            .openPopup();
        L.circle([x.latlng.lat, x.latlng.lng], 100,{
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.6 
        }).addTo(map);
        for (i=0;i<id_latlng.length;i++){
            var a = x.latlng.lat.toString()+','+x.latlng.lng.toString();
            if (id_latlng[i].latlng == a){
                $('#'+id_latlng[i].id).css({"background": "#428BCA"});
            }
        }
        addNominatim(x.latlng.lat.toString()+','+x.latlng.lng.toString());
    });
}

function addComent(i, resp2){
    var dic = {'id': i, 'latlng': resp2.items[i].location.position.latitude.toString()+','+resp2.items[i].location.position.longitude.toString()};
    id_latlng.push(dic);
    $("#comentario").append($('<div id='+i+' onclick="clickLocalizar(\''+resp2.items[i].location.position.latitude.toString()+','+resp2.items[i].location.position.longitude.toString()+','+i+'\')"  class="descripcion"><p><h4>'+resp2.items[i].title+"</h4></p>"+'<div class="localizacion" align="center">latitud: '+resp2.items[i].location.position.latitude+'<br>longitud: '+resp2.items[i].location.position.longitude+'</div></div></div>'));
}

function addNominatim(resp){
    $("#images").empty();
    var NominatimAPI = 'http://nominatim.openstreetmap.org/reverse?json_callback=?';
    $.getJSON( NominatimAPI, {
        lat: resp.split("x")[0],
        lon: resp.split("x")[1],
        zoom: 27,
        addressdetails: 1,
        format: "json"
    })
    .done(function( data ) {
        // para la galeria
        $('.gallery').each(function() {
            $(this).magnificPopup({
                delegate: 'a',
                type: 'image',
                gallery: {
                  enabled:true
                }
            });
            var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
            $.getJSON( flickerAPI, {
            tags: data.display_name,
            tagmode: "any",
            format: "json"
            })
            .done(function( data ) {
                $.each( data.items, function( i, item ) {
                    var anchor = $("<a>").attr("href", item.media.m).addClass("title", item.title)
                    $( "<img>" ).attr( "src", item.media.m )
                    .addClass("imgpveview")
                    .appendTo(anchor);
                    anchor.appendTo("#images")
                });
            });
        });
    });
}

function clickLocalizar(latlng){
    $("#"+latlng.split(",")[2]).css({'background': '#428BCA'});
    
    var NominatimAPI = 'http://nominatim.openstreetmap.org/reverse?json_callback=?';
    $.getJSON( NominatimAPI, {
        lat: latlng.split(",")[0],
        lon: latlng.split(",")[1],
        addressdetails: 1,
        format: "json"
    })
    .done(function( data ) {
        L.marker([latlng.split(",")[0], latlng.split(",")[1]]).addTo(map)
            .bindPopup(data.display_name+'<br>'+latlng.split(",")[0]+'<br>'+latlng.split(",")[1])
            .openPopup();
        L.circle([latlng.split(",")[0], latlng.split(",")[1]], 100,{
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.6 
        }).addTo(map);
    });
            
    addNominatim(latlng);
}
function deleteMark(){
    $(".descripcion").css({'background': 'silver'});
    clearCircle();
    function clearCircle(){
        for(i in map._layers){
            console.log(map._layers[i]._popup);
            if (map._layers[i]._popup != undefined){
                var lat = map._layers[i]._popup._latlng.lat;
                var lng = map._layers[i]._popup._latlng.lng;
                map.removeLayer(map._layers[i]);
                L.marker([lat, lng]).addTo(map).on('click', marcar);
            }
            else if (map._layers[i]._radius == 1){
                map.removeLayer(map._layers[i]);
            }
        }
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//var clientId = '229258777.apps.googleusercontent.com';
var clientId = '';
var apiKey = 'AIzaSyDh6LD0Xg3H30RMD6HRjJqqk7vPP1FQZgE';
//var apiKey = 'AIzaSyBxP1Mju4NEw8TQQUhwzQtJWPlk1O4gXNc';
var scopes = 'https://www.googleapis.com/auth/plus.me';
function handleClientLoad() {
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth, 1);
}
function checkAuth() {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}
function handleAuthResult(authResult) {
    var authorizeButton = document.getElementById('authorize-button');
    if (authResult && !authResult.error) {
        authorizeButton.style.visibility = 'hidden';
    } else {
        authorizeButton.style.visibility = '';
        authorizeButton.onclick = handleAuthClick;
    }
}
function handleAuthClick(event) {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
    return false;
}
