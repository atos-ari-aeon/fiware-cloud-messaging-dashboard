/**
    Copyright (C) 2014 ATOS

    This file is part of AEON.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    Authors: Javier García Hernández (javier.garcia@atos.net)
             Baris Kara (baris.kara@atos.net)

  */

/*
	Controller for the login
*/

function loginCtrl($rootScope, $scope, $location, Cookies, $cookieStore, Authentication, config){	

    //Shows the loginView template
    $rootScope.actualView = 'views/loginView.html'
    $scope.rememberUser = false;
    $scope.serverDown = false;
    $scope.user = new Object();
    $scope.user.type = "user";	


    $(document).ready(function(){
        //To avoid the login window to disappear
        $(function() {		  
            // Setup drop down menu
            $('.dropdown-toggle').dropdown();

            // Fix input element click problem
            $('.dropdown input, .dropdown label, .btn').click(function(e) {
                e.stopPropagation();
            });

            $(".nav-link").click(function(e) {	  	
                e.preventDefault();
                var link = $(this);
                var href = link.attr("href");
                $("html,body").animate({scrollTop: $(href).offset().top - 80}, 500);
                //link.closest(".navbar").find(".navbar-toggle:not(.collapsed)").click();
            });

            // $window = angular.element(window);

            //  $('div').data('type','background').each(function(){     

            //     var $bgobj = $(this); // assigning the object

            //     $window.scroll(function() {
            //         var yPos = -($window.scrollTop() / $bgobj.data("speed")); 

            //         // Put together our final background position
            //         var coords = '50% '+ yPos + 'px';

            //         // Move the background
            //         $bgobj.css({ backgroundPosition: coords });
            //     }); 
            // }); 
            toastr.options.positionClass = "toast-bottom-full-width";  
            toastr.options.showDuration = 1000;          
            toastr.info("<div ><label style=\"color:#77B4D6; font-family: helvetica, arial, sans-serif; font-size:10pt;\">"+config.COOKIES_POLICY+"</label></div>");

        });
    })

    $rootScope.configToastr = function(){
        toastr.options = {
          "closeButton": true,
          "debug": false,
          "positionClass": "toast-top-right",
          "onclick": null,
          "showDuration": "5000",
          "hideDuration": "1000",
          "timeOut": "5000",
          "extendedTimeOut": "1000",
          "showEasing": "swing",
          "hideEasing": "linear",
          "showMethod": "fadeIn",
          "hideMethod": "fadeOut"
        }
    }

    $rootScope.configToastr();

    $scope.showNavbarTabs = function(){

        var showIt = true;
        $scope.activateBack = false;
        if($rootScope.actualView != 'views/loginView.html' ){
            showIt = false;		
            $scope.activateBack = true;
        }

        return showIt;
    }

    $scope.goBackHome = function(){		
        $rootScope.actualView = 'views/loginView.html';
    }	

    $scope.login = function(){
        //Tries to log in the system
        Authentication.login($scope.user).then(function(data){	            

            //If the user exists, we move him to the main page			
            if(data.code == 200){
                $rootScope.userIdentified = true
                //Save the user identifier
                $rootScope.userId = $scope.user.username;
                /*TO-DO: after adding profile picture functionality, user object should be retireved
					from service and userImage should be extracted from this data*/
                $rootScope.userImage = 'img/profile-placeholder.png';
                //sets cookie expiration date 60 days if user clicks "remember me"
                if($scope.rememberUser){
                    Cookies.setExpDate(config.COOKIE_NAME, config.SESSION_EXPIRE_DAYS);	
                }
                //Redirect to the main page
                $location.path('/main');
            }	
        },
        function(data){ //If user is not defined                       
           $rootScope.userIdentified = false;

           if(data == 'Unauthorized'){
                // $scope.serverDown = false;
                $scope.invalidUser = true;
           }
           else{
                // $scope.serverDown = true;
                toastr.error('Server unreachable. Please, contact the administrator.');
                $scope.invalidUser = false;
           }
           
        });
    }

    //Redirects to the sign up view
    $scope.signUp = function(){
        $scope.serverDown = false;
        $rootScope.actualView = 'views/signUp.html'

    }
    //requests a password reset 
    $scope.resetPassword = function(){

        $rootScope.actualView = 'views/resetPassword.html'

    }
    //Redirects to the main view
    $scope.goHome = function(){

        if($rootScope.userIdentified == true)
            $location.path('/main');
        else
            $location.path('/');

    }

    //Manage the navigation bar
    $scope.manageMenu = function(option){

        if(option=="home"){
            $rootScope.actualView = 'views/loginView.html'
        }	

        else if(option=="subApp"){
            //$scope.menuOption = 'views/suscriptionApp.html';
            window.open('indexSubDemo.html') ;
        }	

        else if(option=="pubApp"){
            //$scope.menuOption = 'views/suscriptionApp.html';			
            window.open('indexPubDemo.html') ;

        }

    }

    //Watch the username. When it changes, hides the 'user invalid' label
    $scope.$watch('user.username', function(){
        $scope.invalidUser = false;
        if(!$rootScope.userIdentified){
            if($scope.user != undefined)
                $scope.user.password = '';
        }

    }, true);	

    $scope.quickStart = config.QUICK_START;
    for(var i = 0; i < $scope.quickStart.length; i++){
        $scope.quickStart[i].href = 'http://'+config.AEON_HOST+':'+config.AEON_PORT+$scope.quickStart[i].href;
        $scope.quickStart[i].example = 'http://'+config.AEON_HOST+':'+config.AEON_PORT+$scope.quickStart[i].example;
    }

    $scope.atosFindUs = config.ATOS_LOCATION;
    $scope.atosContactUs = config.AEON_CONTACT_ICONS;

}


/*
	Controller for the signup
*/
function signUpCtrl($scope, $rootScope, $location, Users, Authentication, $cookieStore, vcRecaptchaService, config, $modal){

    $scope.user = new Object();
    var passStrength = 0;

    $scope.openCaptchaModel = function(){
        $scope.user.type = "user";
        if(!$scope.user.username || !$scope.user.password || !$scope.passwordRetype){
            $scope.emptyField = true;
            return;
        }
        if(passStrength == 0){
            $scope.weakPassword = true;
            return;
        }
        if($scope.user.password != $scope.passwordRetype){
            $scope.passMismatch = true;
            return;
        }
        var modalInstance = $modal.open({
            templateUrl: 'captcha.html',
            controller: CaptchaCtrl
        });
        /*callback of channel update*/
        modalInstance.result.then(function (captchaData) {
            if(captchaData != null)
                signUp(captchaData);
        });
    }

    var signUp = function(captcha){
        $scope.serverDown = false;

        $scope.user.captchaData = captcha;
        //Creates the new user
        Users.newUser($scope.user).then(function(data){				
            if(data.httpStatus == 200){
                //logs in user and directs to main page
                Authentication.login($scope.user).then(function(data){								
                    if(data.code == 200){
                        $rootScope.userIdentified = true
                        $rootScope.userId = $scope.user.username;
                        /*TO-DO: after adding profile picture functionality, user object should be retireved
							from service and userImage should be extracted from this data*/
                        $rootScope.userImage = 'img/profile-placeholder.png';
                        $location.path('/main')
                    }
                },function(data){ 
                    //If user is not defined
                    $rootScope.userIdentified = false;
                })
            } 
        },function(data){ 
            if(data.code == 603){
                $scope.wrongCaptcha = true;
                // $scope.serverDown = false;
                $scope.existingUser = false;
            }
            else if(data.code == 202){
                $scope.existingUser = true;
                // $scope.serverDown = false;
                $scope.wrongCaptcha = false;
            }
            else{
                toastr.error('Server unreachable. Please, contact the administrator.');
                $scope.existingUser = false;                
                $scope.wrongCaptcha = false;
            }
        });	
    }

    $scope.getStrength = function(){
        if($scope.user.password == ''){
            $scope.strength = '';
            return;
        }
        if(passStrength == 0){
            $scope.strength = 'weak';
            return 'label label-danger';
        }else if(passStrength == 1){
            $scope.strength = 'medium';
            return 'label label-warning';
        }else if(passStrength == 2){
            $scope.strength = 'strong';
            return 'label label-success';
        }
    }


    //Watch the username. When it changes, hides the 'user invalid' label
    $scope.$watch('user.username', function(){
        $scope.wrongCaptcha = false;
        $scope.existingUser = false;
        if($scope.user.username && $scope.user.password && $scope.passwordRetype){
            $scope.emptyField = false;
        }
        if(!$rootScope.userIdentified){
            //$rootScope.userIdentified = true;
            $scope.user.password = '';
            $scope.passwordRetype = '';
        }

    }, true);

    $scope.$watch('user.password', function(){
        $scope.wrongCaptcha = false;
        $scope.weakPassword = false;
        if($scope.user.username && $scope.user.password && $scope.passwordRetype){
            $scope.emptyField = false;
        }
        if($scope.user.password == $scope.passwordRetype){
            $scope.passMismatch = false;
        }
        if ($scope.user.password.length >= 8) {
            passStrength = 2;
        } else if ($scope.user.password.length >= 5) {
            passStrength = 1;
        } else {
            passStrength = 0;
        }
    }, true);

    $scope.$watch('passwordRetype', function(){
        $scope.wrongCaptcha = false;
        if($scope.user.username && $scope.user.password && $scope.passwordRetype){
            $scope.emptyField = false;
        }
        if($scope.user.password == $scope.passwordRetype){
            $scope.passMismatch = false;
        }
    }, true);

}

/*
	Controller for resetting password 
*/

function resetPassCtrl($scope, Users){

    $scope.user = new Object();

    $scope.resetPassword = function (){
        if($scope.user.username == undefined || $scope.user.username == ''){
            $scope.emptyEmail = true;
            return;
        }
        Users.resetPassword($scope.user.username).then(function(data){
            if(data.httpStatus == 200)
                $scope.resetSuccess = true;				
        }, function(data){
            if(data.httpStatus == 404){                
                $scope.invalidEmail = true;	
                $scope.emailError = false;
            }
            else if (data.httpStatus == 500){
                $scope.emailError = true;
                $scope.invalidEmail = false; 
            }
            else{
                toastr.error('Server unreachable. Please, contact the administrator.');
                $scope.emailError = false;
                $scope.invalidEmail = false;
            }
        } 
                                                      );
    }

    $scope.$watch('user.username', function() {
        if($scope.user.username != '')
            $scope.emptyEmail = false;
        $scope.invalidEmail = false;
        $scope.resetSuccess = false;
        $scope.emailError = false;
    }, true);
}

/*
		 Controller for creating a new password after password resetting
*/

function createPassCtrl($scope, $rootScope, $location, $timeout, Users){

    $scope.user = new Object();
    var passStrength = 0;

    $scope.goBackHome = function(){		
        window.open('index.html', '_self');
    }

    $scope.createPassword = function(){
        $scope.user.type = "user";
        if(!$scope.user.username || !$scope.user.password || !$scope.user.passwordRetype || !$scope.tempCode){
            $scope.emptyField = true;
            return;
        }
        if($scope.user.password != $scope.user.passwordRetype){
            $scope.passMismatch = true;
            return;
        }
        if(passStrength == 0){
            $scope.weakPassword = true;
            return;
        }
        Users.createPassword($scope.user, $scope.tempCode).then(function(data){
            $scope.onTimeOut = function(){
                $location.path('/');
            };
            if(data.httpStatus == 200){
                //After changing password, a timeout is set to show user operation is successful and user is directed to login page
                $scope.passwordCreated = true;
                var navTimeOut = $timeout($scope.onTimeOut, 5000);
            }
        }, function(data){
            if(data.httpStatus == 404){
                $scope.invalidEmail = true;
                $scope.expiredCode = false;
            }
            else if(data.httpStatus == 500){
                $scope.expiredCode = true;
                $scope.invalidEmail = false;
            }
            else{
                toastr.error('Server unreachable. Please, contact the administrator.');
                $scope.invalidEmail = false;
                $scope.expiredCode = false;
            }
        });
    }

    $scope.getStrength = function(){
        if($scope.user.password == undefined || $scope.user.password == ''){
            $scope.strength = '';
            return;
        }
        if(passStrength == 0){
            $scope.strength = 'weak';
            return 'label label-danger';
        }else if(passStrength == 1){
            $scope.strength = 'medium';
            return 'label label-warning';
        }else if(passStrength == 2){
            $scope.strength = 'strong';
            return 'label label-success';
        }
    }

    $scope.$watch('user.username', function() {
        $scope.invalidEmail = false;
        if($scope.user.username != '')
            $scope.emptyField = false;
    }, true);

    $scope.$watch('user.password', function() {
        $scope.weakPassword = false;
        if($scope.user.password == $scope.user.passwordRetype)
            $scope.passMismatch = false;
        if($scope.user.password != '')
            $scope.emptyField = false;
        if($scope.user.password != undefined){
            if ($scope.user.password.length >= 8) 
                passStrength = 2;
            else if ($scope.user.password.length >= 5) 
                passStrength = 1;
            else 
                passStrength = 0;
        }
    }, true);

    $scope.$watch('user.passwordRetype', function() {
        if($scope.user.password == $scope.user.passwordRetype)
            $scope.passMismatch = false;
        if($scope.user.passwordRetype != '')
            $scope.emptyField = false;
    }, true);

    $scope.$watch('tempCode', function() {
        $scope.expiredCode = false;	
        $scope.wrongCode = false;	
        if($scope.tempCode != '')
            $scope.emptyField = false;
    }, true);

}

/*Controller for Captcha Model*/
function CaptchaCtrl($scope, $modalInstance, config){
    $scope.recaptchaKey = config.RECAPTCHA_PUBLIC_KEY;
    $scope.model = {
        captcha: {
            challenge: '',
            response: ''
        }
    };
    $scope.verifyCaptcha = function(){
        if(!$scope.model.captcha.challenge || !$scope.model.captcha.response){
            $scope.emptyCaptcha = true;
            return;
        }
        var captcha = {
            challenge: $scope.model.captcha.challenge,
            response: $scope.model.captcha.response
        };
        $modalInstance.close(captcha);
    }
    $scope.cancelCaptcha = function(){
        $modalInstance.dismiss('cancel');
    }
    $scope.$watch('model.captcha.response', function() {
        if($scope.model.captcha.response != '')
            $scope.emptyCaptcha = false;
    }, true);
}

/*
		 Controller for the images carousel
*/

function carouselCtrl($scope, config){

    $scope.myInterval = 5000;

    $scope.slides = config.AEON_CAROUSEL_SLIDES;

    $scope.isActive = function(index){
        if(index == 0)
            return "active";
        return "";
    }

    $scope.isCarouselActive = function(index){
        if(index == 0)
            return "item active";
        return "item";
    }

}

function featuresCtrl($scope, config){

    $scope.features = config.FEATURES;
}

function mapCtrl($scope, $rootScope, config, Cookies){

    var pubUrl = '//'+config.AEON_HOST+':'+config.AEON_PORT+'/publish/'+config.LIVE_DEMO_PUBKEY;
    var subUrl = '//'+config.AEON_HOST+':'+config.AEON_PORT+'/subscribe/'+config.LIVE_DEMO_SUBKEY;	

    var iconURLPrefix = 'http://maps.google.com/mapfiles/ms/icons/';

    var icons = [
        iconURLPrefix + 'red-dot.png',
        iconURLPrefix + 'blue-dot.png',
        iconURLPrefix + 'orange-dot.png',
        iconURLPrefix + 'purple-dot.png',
        iconURLPrefix + 'pink-dot.png',      
        iconURLPrefix + 'yellow-dot.png',
        iconURLPrefix + 'red.png',
        iconURLPrefix + 'blue.png',
        iconURLPrefix + 'orange.png',
        iconURLPrefix + 'purple.png',
        iconURLPrefix + 'pink.png',      
        iconURLPrefix + 'yellow.png'

    ];

    var myIcon = null;
    
    var MAX_ICONS = 100;

    var markersArray = [];

    function makeid(next)
    {
        var ip = '';
        $.getJSON("//jsonip.appspot.com/?callback",function(data){				
            ip = data.ip;
            var text = "liveDemo-"+ip+'-';
            var possible = "0123456789";

            for( var i=0; i < 8; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            next(text);

        });	    
    }

    function generateSubscription(next){

        var id = makeid(function(id){
            var data = {
                id: id,
                desc: id+'-desc'
            }

            next(data);
        });	
    }

    function clearOverlays() {
        for (var i = 0; i < markersArray.length; i++ ) {
            markersArray[i].setMap(null);
        }
        markersArray = [];
    }

    function setDataToMap(message, channel){		

        if ((message.icon == null) || (message.icon == undefined))
            var iconType = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
        else
            var iconType = icons[message.icon];

        var marker = new google.maps.Marker({
            map:$rootScope.map,
            draggable:false,
            animation: google.maps.Animation.DROP,
            icon: iconType,
            position: new google.maps.LatLng(message.latitude, message.longitude)
        });

        if (markersArray.length >= MAX_ICONS){
            clearOverlays();
        } else
            markersArray.push(marker);



    }

    function subscribe(sdkSub){
        sdkSub.subscribe(function controlFn(data){			 						
            setDataToMap(data);
        }, function deliveriedMessage(message){									
            console.log(message);		
        });
    }

    Cookies.getCookie('aeon_subscription').then(function(data){

        var subscriptionData;

        var sdkSub;

        if(data == undefined){			
            generateSubscription(function(data){
                subscriptionData = data;
                Cookies.setCookie('aeon_subscription', Base64.encode(JSON.stringify(subscriptionData))).then(function(){
                    sdkSub = new AeonSDK(subUrl, subscriptionData);

                    subscribe(sdkSub);
                });

                // console.log(subscriptionData);
            });

        }
        else{
            
            subscriptionData = JSON.parse(Base64.decode(data));			
            sdkSub = new AeonSDK(subUrl, subscriptionData);

            subscribe(sdkSub);

            // console.log(subscriptionData)
        }	

        myIcon = Math.floor(Math.random()*12);


    });

    //google.maps.visualRefresh = true;	
    function initialize() {

        var mapOptions = {
            center: new google.maps.LatLng(40.416, -3.703),
            zoom: 15,	      
            scrollwheel:false,	
            disableDoubleClickZoom: false,      
            disableDefaultUI: true,
            mapTypeControl: true
        };

        $rootScope.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    }

    google.maps.event.addDomListener(window, 'load', initialize());		


    //Gets a random point
    function getRandomInRange(from, to, fixed) {
        return (Math.random() * (to - from) + from).toFixed(fixed) * 1;	    
    }	

    //function generateSubscription

    $scope.publishRandomPosition = function(){

        var sdkPub = new AeonSDK(pubUrl);

        var latitude = 0;
        var longitude = 0;
        var maxLat = 40.411;
        var minLat = 40.42;
        var maxLong = -3.695;
        var minLong = -3.711;	

        //Random value for latitude
        latitude = getRandomInRange(minLat, maxLat, 5);

        //Random value for longitude
        longitude = getRandomInRange(minLong, maxLong, 5);

        //JSON to invoke the method with the coordinates
        var coordinates = {
            icon: myIcon,
            latitude: latitude,
            longitude: longitude,
            clientDate: moment().format("D/M/YYYY HH:mm:ss:SSS ZZ")
        }	

        sdkPub.publish(coordinates, function(message){	
            //console.log(message);			
        });

    }

}