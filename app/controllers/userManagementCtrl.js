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
  Controller for the user management view
*/

function userManagementCtrl($rootScope,$scope, Users, Authentication){

  $scope.isCollapsed = true;
  $scope.password = {
	current: '',
	newPass: '',
	retype: ''
  }
  var passStrength = 0;

	if($rootScope.userId != undefined){
	//Get user information
		Users.getUser($rootScope.userId).then(function(data){		
	  //Assign it here to show it in the view
			$scope.user = data.result[0];

		}, function(data){
			toastr.clear();
			if(data.httpStatus == 401)
				toastr.error('User not authenticated.');
			else
				toastr.error('Server unreachable. Please, contact the administrator.');
			
		});
	}

  $scope.reverseCollapse = function (){
	$scope.isCollapsed = !$scope.isCollapsed;
	if(!$scope.isCollapsed){
	  resetPassFields();
	  removeAlerts();
	}
  }

  $scope.cancelPassChange = function(){
	$scope.isCollapsed = true;
	resetPassFields();
	removeAlerts();
  }

  $scope.getStrength = function(){
		if($scope.password.newPass == ''){
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
  
  $scope.changePassword = function(){
	if(!$scope.password.current || !$scope.password.newPass || !$scope.password.retype){
	  $scope.emptyField = true;
	  return;
	}
	if(passStrength == 0){
		$scope.weakPassword = true;
		return;
	}
	if($scope.password.newPass != $scope.password.retype){
	  $scope.passMismatch = true;
	  return;
	}
	/*checks if the current password is correct via login service*/
	var currentUser = {
		username: $scope.user.username,
		password: $scope.password.current,
		type: 'user'
	}
	Authentication.login(currentUser).then(function(data){
		if(data.code == 200){
			var updatedUser = {
			  password : $scope.password.newPass,
			  type : 'user'
			}
			Users.changePassword($scope.user.username, updatedUser).then(function(data){
			  if(data.code == 200){
				 $scope.passChangeSuccessful = true;
				 $scope.reverseCollapse();
			  } 		  
			},function(){
				 $scope.passChangeError = true;
				 $scope.reverseCollapse();
			});
		}
	}, function(data){
		if(data == 'Unauthorized'){
            // $scope.serverDown = false;
            $scope.incorrectPass = true;
       }
       else{
            // $scope.serverDown = true;
            toastr.error('Server unreachable. Please, contact the administrator.');
            $scope.incorrectPass = false;
       }		 
	});
  }

  $scope.$watch('password.current', function(){
	if($scope.password.current && $scope.password.newPass && $scope.password.retype){
	  $scope.emptyField = false;
	  $scope.incorrectPass = false;
	}
  }, true)

  $scope.$watch('password.newPass', function(){
  	$scope.weakPassword = false;
	if($scope.password.current && $scope.password.newPass && $scope.password.retype){
	  $scope.emptyField = false;
	}
	if ($scope.password.newPass.length >= 8) {
        passStrength = 2;
    } else if ($scope.password.newPass.length >= 5) {
        passStrength = 1;
    } else {
        passStrength = 0;
    }
  }, true)

  $scope.$watch('password.retype', function(){
	if($scope.password.current && $scope.password.newPass && $scope.password.retype){
	  $scope.emptyField = false;
	}
	if($scope.password.newPass == $scope.password.retype){
	   $scope.passMismatch = false;
	}
  }, true)

  var resetPassFields = function(){
	  $scope.password.current = ''; 
	  $scope.password.newPass = ''; 
	  $scope.password.retype = '';
	}

  var removeAlerts = function(){
	  $scope.emptyField = false;
	  $scope.incorrectPass = false; 
	  $scope.passMismatch = false;
	}
}
