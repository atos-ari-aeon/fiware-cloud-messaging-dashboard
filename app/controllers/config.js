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
  Module of constants to be used in the application
*/


angular.module('AEON.configuration',[])
	.constant('config',{

		/******************************************/
		/*			 Global Config 			  */
		/******************************************/
		RECAPTCHA_PUBLIC_KEY: '',
		COOKIE_NAME: 'aeon.sid',
		SESSION_EXPIRE_DAYS: 60,

		/******************************************/
		/*			 Localhost Config 			  */
		/******************************************/
		// Note - AEON_HOST: Introduce just the domain without the 'http://'
		// AEON_HOST: 'localhost',
		// AEON_PORT: '3000',
		// AEON_GUI_HOST: 'localhost',
		// AEON_GUI_PORT: '8000',
		// SUBSCRIPTION_HOST:'localhost',
		// SUBSCRIPTION_PORT:'7789',		


		/******************************************/
		/*      arisrv22.es.atos.net Config       */
		/******************************************/
		//AEON_HOST: 'api.lcb.atosresearch.eu',
		//AEON_PORT: '80',
		//AEON_GUI_HOST: 'lcb-gui.herokuapp.com',
		//AEON_GUI_PORT: '80',
		//SUBSCRIPTION_HOST:'sub.lcb.atosresearch.eu',
		//SUBSCRIPTION_PORT:'443',
		
		

		/******************************************/
		/*             Heroku Config              */
		/******************************************/
		 AEON_HOST: 'lcb.herokuapp.com',		
		 AEON_PORT: '80',
		 AEON_GUI_HOST: 'lcb-gui.herokuapp.com',
		 AEON_GUI_PORT: '80',		
		 SUBSCRIPTION_HOST:'lcb-sub.herokuapp.com',
		 SUBSCRIPTION_PORT:'80',						
		 

		/******************************************/
		/* 		CAROUSEL SLIDES CONFIGURATION 	  */
		/******************************************/
//		AEON_CAROUSEL_SLIDES:[
//			{
//				image:'img/Ahlsell_logistik_2_1.jpg',
//				text: 'Cloud services to facilitate real time communications\' needs'
//			},
//			{
//				image:'img/cn_intermodal-11.jpg',
//				text: 'Communicate applications and services through a real time network'
//			},
//			{
//				image:'img/img-index3.jpg',
//				text: 'Easy to use, easy to integrate in developments'
//			},
//			{
//				image:'img/pixpandas6.jpg',
//				text: 'Publish/Subscribe information through customized channels'
//			}
//		],

		/******************************************/
		/* 		FEATURES CONFIGURATION 	  */
		/******************************************/
		FEATURES:[
			{
				icon:'img/feature-0.png',
				title:'Real Time',
				text: 'Enhance your communications the fastest way.'
			},
			{
				icon:'img/feature-1.png',
				title:'Internet of Things',
				text: 'Everything can be represented as an Entity with communication channels.'
			},
			{
				icon:'img/feature-2.png',
				title:'Pub/Sub Architecture',
				text: 'Best pattern design for fully decoupled applications.'
			},
			{
				icon:'img/feature-4.png',
				title:'REST API',
				text: 'Open interface to manage AEON\'s capabilities.'
			}
		],

		/******************************************/
		/* 		LIVE DEMO CONFIGURATION 	  */
		/******************************************/		

		LIVE_DEMO_PUBKEY:"",
		LIVE_DEMO_SUBKEY:"",

		
        /******************************************/
		/* 		QUICK START CONFIGURATION 	  */
		/******************************************/		
		QUICK_START:[
			{
				language:'Java',
				href:'/public/downloads/AeonSDK-Java_0.2.0.tgz',
				example: '/public/doc/html/quickstart/java.html'
			},
			{
				language:'Javascript',
				href:'/public/downloads/AeonSDK-Javascript_0.2.0.tgz',
				example: '/public/doc/html/quickstart/javascript.html'
			},			
			{
				language:'Node JS',
				href:'/public/downloads/AeonSDK-nodejs_0.2.0.tgz',
				example: '/public/doc/html/quickstart/nodejs.html'
			}
		],

		/******************************************/
		/* 			CONTACT CONFIGURATION 		  */
		/******************************************/
		AEON_VERSION:'0.2',
		AEON_COPYRIGHT: 'Copyright 2014 ATOS S.A.',
		ATOS_LOCATION: {
			img:'img/findUs2.png',
			address: [
				'ATOS SPAIN S.A.',
				'C/Albarracín 25',
				'28037 Madrid',
				'SPAIN'
			]
		},
		AEON_CONTACT_ICONS:[
			{
				icon:'img/mail.png',
				href:'mailto:aeon-support@lists.atosresearch.eu'
			},
			{
				icon:'img/twitter.png',
				href:'https://twitter.com/aeon_ari'
			}
		],
		AEON_CONTACT:['aeon-support@lists.atosresearch.eu'],
        COOKIES_POLICY: "AEON uses cookies to deliver superior functionality and to enhance your experience in our platform. Continued used of this platform indicates you accept this policy."
	});
