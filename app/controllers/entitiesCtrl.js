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


function entitiesCtrl($rootScope,$scope, Entity, Channel, $document, config, Authentication, $timeout, $modal){	

	$scope.selectedChannel = []; //Array to store the selected channel of a card
	$scope.channelInfo = []; //Array to store the channel info for a channel
	$scope.showChannelInfo = []; //Array that stores if the channel info has to be shown or not
	$scope.entityEmpty = false; //Determines if a card is a new card or an existing one
	$scope.channelEmpty = false; //Determines if a channel is a new one or an existing one
	$scope.newCardClicked = false; //determines if the new entity panel is clciked

	$scope.entityname = []; //Array to store the entity name of the cards
	$scope.entitydescription = []; //Array to store the entity description of the cards
	$scope.channelname = []; //Array to store the channel name of an entity
	$scope.channeldescription = [];	//Array to store the channel description of an entity
	$scope.newCardEntity = new Object();
	$scope.lastIndex = 0;

	/*Retrieves the entities*/
	$scope.getEntities = function(){
		Entity.getEntities().then(function(data){		
			//Store the basic information for the entities
			$scope.entities_old = data.result;						
			//Array to store the entities. This is the variable linked to the view. The information stored here will be shown.
			$scope.entities = [];			
			//Iteration over the entities to complete all the information about them
			for(var i = 0; i < $scope.entities_old.length; i++){					
				Entity.getEntity($scope.entities_old[i]._id).then(function(entity){						
					entity.result[0].entityname = entity.result[0].entityname.toUpperCase();
					//Add the entity to the entities array
					$scope.entities.push(entity.result[0]);									
				})			
			}			
		}, function(data){
			toastr.clear();
			if(data.httpStatus == 401)
				toastr.error('User not authenticated.');
			else
				toastr.error('Server unreachable. Please, contact the administrator.');

		});	
	}

	//Retrieve the entities 
	$scope.getEntities();

	$scope.showNewEntityCard = function(){
		$scope.newCardClicked ^= true;
		$scope.newCardEntity = {
			entityname:'',
			entitydescription:'',			
			newEntity: true,
			entityEmpty: false,
			addingChannel: false			
		};
	}

	$scope.saveNewCardEntity = function(){
		if(!$scope.newCardEntity.entityname  || !$scope.newCardEntity.entitydescription){					
			//Set the entityEmpty to true to control visual components
			$scope.newCardEntity.entityEmpty = true;	
			return;
		}
 
		//JSON needed to store the entity into the DB
		var entityToSave = {
			entityname: $scope.newCardEntity.entityname,
			entitydescription: $scope.newCardEntity.entitydescription,
			type:"entity"
		}
		//Saves the new entity to the DB
		Entity.newEntity(entityToSave).then(function(data){
			$scope.hideChannels();
			var insertedEntity = data.result[0];
			insertedEntity.entityname = insertedEntity.entityname.toUpperCase();
			$scope.entities.push(insertedEntity);
			$scope.showNewEntityCard();				
		},function(data){
			toastr.clear();
			if(data.httpStatus == 401)
				toastr.error('User not authenticated.');
			else
				toastr.error('Server unreachable. Please, contact the administrator.');

		});

	}

	/*Determines if a card is a new entity or not. Used to show or hide visual components*/
	$scope.isNewCard = function(entity){
		if(entity.newEntity==true)
			return true;
		else
			return false;
	}


	/*Determines if a card is an old entity or not. Used to show or hide visual components*/
	$scope.isOldCard = function(entity){
		if(entity.newEntity==true)
			return false;
		else
			return true;

	}

	/*Stores the current iteration index from the view*/
	$scope.getEntityIndex = function(index){
		$scope.selectedIndex = index;				
	}	

	/*Adds a new entity to the entities array*/
	$scope.addEntity = function(){		

		//Variable to insert a new registry in the entities array
		var newEntity = {
			entityname:'',
			entitydescription:'',			
			newEntity: true,
			entityEmpty: false,
			addingChannel: false			
		};
		if($scope.entities.length != undefined && $scope.entities.length!=0){
			if(!$scope.entities[0].newEntity){ //Controls if the is a new card shown to record
				//Insert the new entity
				$scope.entities.splice(0,0,newEntity);		
				//When a new card is inserted, all the channels' information of other cards is hidden
				$scope.hideChannels();						
			}
			else return;
		}
		else{ //Is the first card to enter
			//Insert the new entity
			$scope.entities.splice(0,0,newEntity);
		}
	}

	/*controls data and updates entity*/
	$scope.updateEntity = function(data, field, index, entity) {
			if (data == '') {
				return "This field cannot be empty";
			}
			$scope.selectedIndex = index;
			//create entity with updated fields 
			var updatedEntity = {
				_id: entity._id,
				entityname: entity.entityname,
				entitydescription: entity.entitydescription,
				type:"entity"
			};
			if(field == 'NAME'){
				updatedEntity.entityname = data;
			}else if(field == 'DESC')
				updatedEntity.entitydescription = data;
			Entity.updateEntity(updatedEntity).then(function(data){ 
				if(data.code == 200)
					return true;
			}, function(data){
				toastr.clear();
				if(data.httpStatus == 401)
					toastr.error('User not authenticated.');
				else
					toastr.error('Server unreachable. Please, contact the administrator.');
				
			});
		}


	/*Saves the new entity to the database*/
	$scope.saveNewEntity = function(entity, index){

		if(!$scope.entityname[index]  || !$scope.entitydescription[index]){					
			//Set the entityEmpty to true to control visual components
			$scope.entities[index].entityEmpty = true;	
			return;
		}
 
		//JSON needed to store the entity into the DB
		var entityToSave = {
			entityname: $scope.entityname[index],
			entitydescription: $scope.entitydescription[index],
			type:"entity"
		}

		//Saves the new entity to the DB
		Entity.newEntity(entityToSave).then(function(data){

			$scope.entities[0]._id = data.result[0]._id;			
			
			//To show the name and description in the view.
			entity.entityname = $scope.entityname[index].toUpperCase();

			entity.entitydescription = $scope.entitydescription[index];

			//Now it is not a new entity
			entity.newEntity = false;

			//Open the possibility of adding a new channel
			$scope.enableChannelAddition = true;

			entity.entityEmpty = false;

			//Variables for the $watch function. They have to be cleaned.
			$scope.entityname[index] = '';
			$scope.entitydescription[index] = '';

		}, function(data){
			toastr.clear();
			if(data.httpStatus == 401)
				toastr.error('User not authenticated.');
			else
				toastr.error('Server unreachable. Please, contact the administrator.');

		});

	}

			
	/* deletes an entity*/
	$scope.deleteEntity = function (entity, index){
		$scope.selectedIndex = index;
		var isConfirmed = confirm('Are you sure you want to delete entity ' + entity.entityname + '?');   
			if (isConfirmed) {
				$scope.hideChannels();
			$scope.$apply();
				Entity.deleteEntity(entity).then(function(data){
					if(data.code == 200){
					//fadeOut effect
					var wait = window.setTimeout( function(){
						$("#tarjeta-"+$scope.selectedIndex).toggleClass('fadeInLeftBig fadeOutRightBig');						  
						window.setTimeout( function(){
							$scope.entities.splice($scope.selectedIndex,1);					
							$scope.$apply();				
						}, 700 );									
					}, 200);} 
				},function(data){
					toastr.clear();
					if(data.httpStatus == 401)
						toastr.error('User not authenticated.');
					else
						toastr.error('Server unreachable. Please, contact the administrator.');

				});
			}
	}


	var disableEntityAlerts = function (entity, duration) {
		var alertTimeOut = function(){
	 	 	if(entity.authorizationError != undefined)
	 	  		entity.authorizationError = false;
	 	  	if(entity.entityError != undefined)
	 	  		entity.entityError = false;
	    };
	    var timeOut = $timeout(alertTimeOut, duration);
	}

	/*Adds a new entity to the channels array*/
	$scope.addNewChannel = function(entity,index){		
		$scope.selectedIndex = index;
		$scope.hideOtherChannels(index);
		//Hide the channel info for this card
		if($scope.selectedIndex != undefined){
			$scope.showChannelInfo[$scope.selectedIndex] = false;
			$scope.selectedChannel[$scope.selectedIndex] = null;
		}
		//Mark card as adding channel
		if(entity.addingChannel == false || entity.addingChannel == null)
			entity.addingChannel = true;		
	}

	/*Saves the new channel to the DB*/
	$scope.saveChannel = function(index, entity){
		if(!$scope.channelname[index] || !$scope.channeldescription[index]){
			entity.channelEmpty = true;
			return;
		}		
		//JSON needed to store the channel into the DB
		var channel = {
			channelname:$scope.channelname[index],
			channeldesc:$scope.channeldescription[index],
			type:"channel"
		}
		//Gets the entity id needed to invoke the service
		var entityId = $scope.entities[index]._id;
		//Saves the new channel
		Channel.newChannel(entityId, channel).then(function(data){
			channel._id = data.result[0]._id;			
			//Update the entities array to show the new channel
			if($scope.entities[index].channels == null)
				$scope.entities[index].channels = [];			
			$scope.entities[index].channels.push(channel);
			//This will hide the new channel fields.
			$scope.cancelChannel(entity, index);
			//Variables for the $watch function. They have to be cleaned.
			$scope.channelname[index] = '';
			$scope.channeldescription[index] = '';
			entity.channelEmpty = false;
		},function(data){
			toastr.clear();
			if(data.httpStatus == 401)
				toastr.error('User not authenticated.');
			else
				toastr.error('Server unreachable. Please, contact the administrator.');

		});
	}

	var disableChannelAlerts = function (channel, duration) {
		var alertTimeOut = function(){
			if(channel.channelError != undefined)
				channel.channelError = false;
			if(channel.authorizationError != undefined)
					channel.authorizationError = false;
			};
			var timeOut = $timeout(alertTimeOut, duration);
	}

	/*controls data and updates channel*/
	$scope.updateChannel = function(data, field, index, channel) {
			if (data == '') {
				return "This field cannot be empty";
			}
			//create channel with updated fields 
			var updatedChannel= {
				_id: channel._id,
				channelname: channel.channelname,
				channeldesc: channel.channeldesc,
				type: 'channel'
			};
			if(field == 'NAME'){
				updatedChannel.channelname = data;
			}else if(field == 'DESC')
				updatedChannel.channeldesc = data;
			Channel.updateChannel($scope.entityId, updatedChannel).then(function(data){
				if(data.code == 200){
					/*updates channel on dropdown list*/
					$scope.selectedChannel[$scope.selectedIndex].channelname = updatedChannel.channelname;
					$scope.selectedChannel[$scope.selectedIndex].channeldesc = updatedChannel.channeldesc;
					return true;
				} 
			}, function(data){
				toastr.clear();
				if(data.httpStatus == 401)
					toastr.error('User not authenticated.');
				else
					toastr.error('Server unreachable. Please, contact the administrator.');

			});
		}

	/* deletes a channel*/
	$scope.deleteChannel = function (){
		var selectedChannel = $scope.selectedChannel[$scope.selectedIndex];
		var selectedEntity = $scope.entities[$scope.selectedIndex];
		var isConfirmed = confirm('Are you sure you want to delete channel ' + selectedChannel.channelname + '?');   
			if (isConfirmed) {
				Channel.deleteChannel(selectedEntity._id, selectedChannel._id).then(function(data){
					if(data.code == 200){
						$scope.hideChannel($scope.selectedIndex);
						//retrieve the channels after deletion
						Channel.getChannels($scope.entityId).then(function(data){
							if(data.code == 200){
								selectedEntity.channels = data.result;
							} 
						});
						disableEntityAlerts(selectedEntity, 5000);	
					} 
				}, function(data){
					toastr.clear();
					if(data.httpStatus == 401)
						toastr.error('User not authenticated.');
					else
						toastr.error('Server unreachable. Please, contact the administrator.');

				});
			}
	}

	/*Cancel the creation of the new channel*/
	$scope.cancelChannel = function(entity, index){
		entity.addingChannel = false;
		entity.channelEmpty = false;
	}

	/*Hides all the channels' info*/
	$scope.hideChannels = function(){
		//Close all the channels info and return to choice combo
		for(var i = 0; i < $scope.entities.length; i++){
			//Hide channel info
			$scope.showChannelInfo[i] = false;

			//Set combo value to null
			$scope.selectedChannel[i]=null;
		}
	}

	/*Hides all the channels but the selected*/
	$scope.hideOtherChannels = function(index){
		if(index == undefined)
			return;
		for(var i = 0; i < $scope.entities.length; i++){
			if(i == index)
				continue;
			$scope.showChannelInfo[i] = false;
			$scope.selectedChannel[i]=null;
		}
	}

	/*Hides a specific channel's info*/
	$scope.hideChannel = function(index){
		$scope.showChannelInfo[index] = false;
		$scope.selectedChannel[index]=null;
	}

	/*Shows or hide the channel info*/
	$scope.showChannelInfo = function(){
		if(entity.newEntity==true)
			return false;
		else
			return true;
	}	

	/*Applies the style to all the cards*/
	$scope.getCardClass = function(entity, type){				

		if($scope.isNewCard(entity)){
			if(type=="new")
				return "card cardChannel animated fadeInLeftBig";
			else
				return "card cardChannel animated fadeOutRightBig";
		}
		else return "card cardChannel animated fadeInUpBig"
	}

	/*Function to obtain the QR code to redirect the user to the publication demo app*/
	// var getQRCode = function(index){
	// 	var qr = new JSQR();

	// 	var code = new qr.Code();
	// 	code.encodeMode = code.ENCODE_MODE.UTF8_SIGNATURE;
	// 	code.version = code.DEFAULT;
	// 	code.errorCorrection = code.ERROR_CORRECTION.L;

	// 	var input = new qr.Input();
	// 	input.dataType = input.DATA_TYPE.URL;

	// 	//Configure the data to be stored in the QR code
	// 	var url = 'http://'+config.AEON_GUI_HOST+":"+config.AEON_GUI_PORT+'/app/indexPubDemoMobile.html?pubUrl='+$scope.channelInfo[$scope.selectedIndex].puburl;

	// 	input.data = {
	// 			 "url": url
	// 	};

	// 	var matrix = new qr.Matrix(input, code);
	// 	matrix.scale = 2;
	// 	matrix.margin = 0;

	// 	var canvas = document.getElementById('canvas-'+index);
	// 	canvas.setAttribute('width', matrix.pixelWidth);
	// 	canvas.setAttribute('height', matrix.pixelWidth);
	// 	canvas.getContext('2d').fillStyle = 'rgb(0,0,0)';
	// 	matrix.draw(canvas, 0, 0);
		
	// }	

	/*Controls the changes of the selected channel*/
	$scope.$watch('selectedChannel', function(){			
	
		if($scope.selectedIndex != undefined && $scope.selectedChannel[$scope.selectedIndex] != null){
			$scope.entities[$scope.selectedIndex].addingChannel = false;
			$scope.entities[$scope.selectedIndex].channelEmpty = false;
		}
		/* hides all other channel info*/
		$scope.hideOtherChannels($scope.selectedIndex);
		if($scope.entities != undefined && $scope.selectedIndex!= undefined){

			//Gets the entity ID
			$scope.entityId = $scope.entities[$scope.selectedIndex]._id;
		
			if($scope.selectedChannel[$scope.selectedIndex]==null)
				$scope.showChannelInfo[$scope.selectedIndex] = false;
			
			//Gets the channel ID
			if( $scope.selectedChannel[$scope.selectedIndex] != undefined)
				var channelId = $scope.selectedChannel[$scope.selectedIndex]._id;	

			if($scope.selectedChannel[$scope.selectedIndex] != undefined){
				if($scope.entities[$scope.selectedIndex].channels.length != 0 && channelId != undefined){					

					//Retrives the complete channel information
					Channel.getChannel($scope.entityId, channelId).then(function(channelInfo){
					
						$scope.channelInfo[$scope.selectedIndex] = channelInfo.result[0];		
						
						//We get the QR code
						//getQRCode($scope.selectedIndex);						

						//Shows the channel information
						$scope.showChannelInfo[$scope.selectedIndex] = true;						 						
					},function(data){
						toastr.clear();
						if(data.httpStatus == 401)
							toastr.error('User not authenticated.');
						else
							toastr.error('Server unreachable. Please, contact the administrator.');

					});
				}
			}
		}
	},true);	

	$scope.$watch('entityname', function(){	

		if($scope.newCardEntity != undefined)
			$scope.newCardEntity.entityEmpty = false;

		if($scope.selectedIndex != undefined){			
			if($scope.entityname[$scope.selectedIndex] != ''){			
				$scope.entities[$scope.selectedIndex].entityEmpty = false;
			}						
		}
	},true);

	$scope.$watch('entitydescription', function(){	

		if($scope.selectedIndex != undefined){			
			if($scope.entitydescription[$scope.selectedIndex] != ''){			
				$scope.entities[$scope.selectedIndex].entityEmpty = false;
			}						
		}
	},true);

	$scope.$watch('newCardEntity.entityname', function(){	
		if($scope.newCardEntity != undefined)
			$scope.newCardEntity.entityEmpty = false;
	},true);

	$scope.$watch('newCardEntity.entitydescription', function(){	
		if($scope.newCardEntity != undefined)
			$scope.newCardEntity.entityEmpty = false;
	},true);


	$scope.$watch('channelname',function(){		
		if($scope.selectedIndex!=undefined){
			if($scope.channelname[$scope.selectedIndex] != '')		
				$scope.entities[$scope.selectedIndex].channelEmpty = false;
		}
	},true)

	$scope.$watch('channeldescription',function(){		
		if($scope.selectedIndex!=undefined){
			if($scope.channeldescription[$scope.selectedIndex]!='')
				$scope.entities[$scope.selectedIndex].channelEmpty = false;
		}
	},true)	

};

