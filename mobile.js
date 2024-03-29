
//Various programStates

var debugOn = 1;

var PROG_MANUAL 			= 0;
var PROG_BASE 				= 1;
var PROG_TEMPOVERRIDE = 2;
var PROG_PROGOVERRIDE = 3;
var	PROG_HOLIDAY 			= 4;
var PROG_MANUALHOLIDAY= 5;
var PROG_AWAYNOW 			= 6;
var PROG_DAYOFF 			= 7;
var PROG_LOCKEDBASE 	= 8;

var STATE_RELAX 			= 0;
var STATE_ACTIVE 			= 1;
var STATE_SLEEP 			= 2;
var STATE_AWAY 				= 3;
var STATE_HOLIDAY			= 4;

var elecTotalToday = 0;
var elecTotalAVG = 0;
var gasTotalAVG = 0;
var gasTotalToday = 0;

var produTotalToday = 0;
var produTotalAVG = 0;
var solarTotalAVG = 0;
var solarNow = 0;


var solarAvailable = 1;
var plugsAvailable = 1;
var detectorsAvailable = 1;
var temperatureAvailable = 1;

var plugUUIDS = ["", "", "", "", "", "", "", "","", "", "", "", "","", "", "", "", "", "", "", "","", "", "", "", ""];
var plugSTATES = ["", "", "", "", "", "", "", "","", "", "", "", "","", "", "", "", "", "", "", "","", "", "", "", ""];

var detectorUUIDS = ["", "", "", "", "", "", "", "","", ""];
var detectorNAMES = ["", "", "", "", "", "", "", "","", ""];

var temperatureNAMES = ["", "", "", "", "", "", "", "","", ""];
var temperatureSTATES = ["", "", "", "", "", "", "", "","", ""];

var THERMOSTAT_STATES = "/hcb_config?action=getObjectConfigTree&package=happ_thermstat&internalAddress=thermostatStates";
var PWRUSAGE_INFO_URL = "/happ_pwrusage?action=GetCurrentUsage";

var ELEC_INFO_LT_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_quantity_lt&rra=10yrdays&readableTime=1&nullForNaN=1&from=";
var ELEC_INFO_NT_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_quantity_nt&rra=10yrdays&readableTime=1&nullForNaN=1&from=";

var ELEC_INFO_LT_hrs_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_quantity_lt&rra=5yrhours&readableTime=1&nullForNaN=1&from=";
var ELEC_INFO_NT_hrs_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_quantity_nt&rra=5yrhours&readableTime=1&nullForNaN=1&from=";

var GASUSAGE_INFO_URL = "/hcb_rrd?action=getRrdData&loggerName=gas_quantity&rra=10yrdays&readableTime=1&nullForNaN=1&from=";
var GASUSAGE_INFO_hrs_URL = "/hcb_rrd?action=getRrdData&loggerName=gas_quantity&rra=5yrhours&readableTime=1&nullForNaN=1&from=";

var SOLAR_INFO_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_solar_quantity&rra=10yrdays&readableTime=1&nullForNaN=1&from=";
var SOLAR_INFONOW_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_solar_quantity&rra=5yrhours&readableTime=1&nullForNaN=1&from=";

var SOLARFLOW_INFO_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_solar_flow&rra=5min&readableTime=1&nullForNaN=1&from=";
var PRODUFLOW_INFO_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_produ_flow&rra=5min&readableTime=1&nullForNaN=1&from="

var PRODU_INFO_LT_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_quantity_lt_produ&rra=10yrdays&readableTime=1&nullForNaN=1&from=";
var PRODU_INFO_NT_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_quantity_nt_produ&rra=10yrdays&readableTime=1&nullForNaN=1&from=";

var SENSOR_INFO_URL = "/tsc/sensors?" + Math.random();

//var WATER_INFO_URL =  "water_mobile.json?tst=" + Math.random();
var WATER_INFO_URL =  "/water.html?tst=" + Math.random();
var WATERFLOW_INFO_URL = "/hcb_rrd?action=getRrdData&loggerName=water_flow&rra=5min&readableTime=1&nullForNaN=1&from=";

//var PLUGS_INFO_URL = "/test.json?tst=" + Math.random();;
var PLUGS_INFO_URL = "/hdrv_zwave?action=getDevices.json";

var PLUG_SWITCH_URL = "/hdrv_zwave?action=basicCommand&uuid=";

var TEMPERATURE_INFO_URL =  "/temperature.html?tst=" + Math.random();

var VERSION_INFO_URL = "version.txt?tst=" + Math.random();
var DETECTOR_INFO_URL = "config_happ_eventmgr.txt?tst=" + Math.random();

var THERMOSTAT_INFO_URL = "/happ_thermstat?action=getThermostatInfo";
var THERMOSTAT_CHANGE_SS_BASE_URL = "/happ_thermstat?action=changeSchemeState";
var SET_TARGET_TEMP_URLCTOR				= function(setpoint) { return "/happ_thermstat?action=roomSetpoint&Setpoint=" + setpoint; };
var thermstatInfoT = null;
var pwrusageInfoT = null;
var elecLTInfoT = null;
var elecNTInfoT = null;

var gasusageInfoT = null;

var solarInfoT = null;
var solarInfoNowT = null;
var solarFlowInfoT = null;
var produFlowInfoT = null;

var produLTInfoT = null;
var produNTInfoT = null;
var waterInfoT = null;
var waterFlowInfoT = null;

var sensorInfoT = null;

var plugsInfoT = null;
var temperatureInfoT = null;

var setTempT = null;

var userActive = false;

var activeState = -1;
var currentTemp = 0;
var currentSetpoint = 0;
var programState = 0;


function initPage()
{
	$.hcb.translatePage();
	
	//console.log("initpage called");
		
	//If we are local we don't need to login
	if(jQuery.hcb.proxy.supported == false)
	{	
		getVersionInfo();
		getDetectorInfo();
		getSolarFlowInfo();
		getPlugsInfo();
		getTemperatureInfo_2();
		getSensorInfo();
		$.mobile.changePage("#main");
	}
	else
	{
		$('#loginForm').on('submit', function (e) {
		var $this = $(this);
	
		//prevent the form from submitting normally
		e.preventDefault();
		$.mobile.showPageLoadingMsg();
		$.post($this.attr('action'), $this.serialize(), function (response) 
		{
			$.mobile.hidePageLoadingMsg();
			if(response.login)
			{
				jQuery.hcb.getLocale();
				jQuery.hcb.reinitTranslation
				
				$.mobile.changePage("#main");
			}
			else 
				alert(ts("Email address and/or password is incorrect. Please try again."));
			}, 'json');
		});
	}
}

function logout()
{
	clearTimeout(pwrusageInfoT);
	clearTimeout(elecLTInfoT);
	clearTimeout(elecLTInfoT);
	clearTimeout(gasusageInfoT);
	clearTimeout(solarInfoT);
	clearTimeout(solarInfoNowT);
	clearTimeout(solarFlowInfoT);
	clearTimeout(produFlowInfoT);
	clearTimeout(produNTInfoT);
	clearTimeout(pwrusageInfoT);
	//clearTimeout(waterFlowInfoT);
	clearTimeout(plugsInfoT);
	clearTimeout(temperatureInfoT);
	
	pwrusageInfoT = null;
	elecLTInfoT = null;
	gasusageInfoT = null;
	solarInfoNowT = null;
	solarFlowInfoT = null;
	produFlowInfoT = null;
	produLTInfoT = null;
	produNTInfoT = null;
	waterInfoT = null;
	waterFlowInfoT = null;
	plugsInfoT = null;
	temperatureInfoT = null;

	clearTimeout(setTempT);	
	setTempT = null;
	clearTimeout(thermstatInfoT);	
	thermstatInfoT = null;
	
	$.mobile.changePage("#login");
}

function getVersionInfo()
{
	$.get(VERSION_INFO_URL, function(data, status){
		if (status.indexOf("succ")>-1){
			$("#version").html("versie " + data);
		}else{
			$("#version").html("");
		}
  });
}

function getDetectorInfo()
{	
	var nr = 0;
	$.get(DETECTOR_INFO_URL, function(data, status){
		if (status.indexOf("succ")>-1){
			var devices = data.split("<device>");
			for (var devicenr in devices) {
				if (devices[devicenr].indexOf("FGSD002")>-1){
					var start = devices[devicenr].indexOf("<internalAddress>") + "<internalAddress>".length;
					var end = devices[devicenr].indexOf("</internalAddress>");
					var detectorUUID = devices[devicenr].substring(start,end);
					console.debug( detectorUUID);
					var start2 = devices[devicenr].indexOf("<devName>") + "<devName>".length;
					var end2 = devices[devicenr].indexOf("</devName>");
					var detectorName = devices[devicenr].substring(start2,end2);
					console.debug( detectorName);
					detectorUUIDS[nr] = detectorUUID;
					detectorNAMES[nr] = detectorName;
					nr++;
				}
			}
		}
  });
}


function getTemperatureInfo_2()
{	temperatureAvailable = 0
	$.get(TEMPERATURE_INFO_URL, function(data, status){
		if (status.indexOf("succ")>-1){
			temperatureAvailable = 1;
			$('#dot_16').show();
			$('#dot_26').show();
			$('#dot_36').show();
			$('#dot_46').show();
			$('#dot_56').show();
			$('#dot_66').show();
		}else{
			temperatureAvailable = 0;
			$('#dot_16').hide();
			$('#dot_26').hide();
			$('#dot_36').hide();
			$('#dot_46').hide();
			$('#dot_56').hide();
			$('#dot_66').hide();
		}
    });
}


function login()
{	
	var url = '/servlet/forwarder/'
	var username=document.getElementById('username').value;
	var password=document.getElementById('password').value;
	alert(username + ' ' + password);
	$.mobile.changePage("#main");
}

function mainPageLoaded()
{
	getThermostatStates();
	getThermostatInfo();
	
}

function mainPageHidden()
{
	if(thermstatInfoT != null)
		clearTimeout(thermstatInfoT);
}

function usagePageLoaded()
{
	getPwrusageInfo();
	getElecLTInfo();
	getGasusageInfo();
	getWaterInfo();
	getWaterFlowInfo();
}

function usagePageHidden()
{
	if(pwrusageInfoT != null)
		clearTimeout(pwrusageInfoT);
	if(getElecLTInfo != null)
		clearTimeout(getElecLTInfo);
	if(getGasusageInfo != null)
		clearTimeout(getGasusageInfo);
	if(getWaterInfo != null)
		clearTimeout(getWaterInfo);
	if(getWaterFlowInfo != null)
		clearTimeout(getWaterFlowInfo);
}


function solarPageLoaded()
{
	getSolarNowInfo()
	getSolarFlowInfo();
	getProduFlowInfo();
	getProduLTInfo();
}

function solarPageHidden()
{
	if(getSolarInfo() != null)
		clearTimeout(getSolarInfo());
	if(getSolarFlowInfo != null)
		clearTimeout(getSolarFlowInfo);
	if(getProduFlowInfo != null)
		clearTimeout(getProduFlowInfo);
	if(getProduLTInfo != null)
		clearTimeout(getProduLTInfo);
}

function plugsPageLoaded()
{
	getPlugsInfo();
}

function plugsPageHidden()
{
	if(getPlugsInfo() != null)
		clearTimeout(getPlugsInfo());
}

function detectorsPageHidden()
{
	if(getPlugsInfo() != null)
		clearTimeout(getPlugsInfo());
}

function detectorsPageLoaded()
{
	getPlugsInfo();
}

function temperaturePageHidden()
{
	if(getTemperatureInfo() != null)
		clearTimeout(getTemperatureInfo());
}

function temperaturePageLoaded()
{
	getTemperatureInfo();
}


function setTempToDiv(divId, temp)
{
	if(!$("#"+divId))
		return;
		
	var setpB = parseInt(temp / 100);
	var setpS = (temp - (setpB*100) ) ? 5 : 0;
	$("#"+divId).html( setpB+ ","+setpS+ "&deg C");
}



function showFormattedIndoorTemp(temperature, setpoint)
{
	/*
	TSC change: round the actual temperature to one decimal 
	*/
	
	var tempInt = parseInt(temperature);
	var setpointInt = parseInt(setpoint);

	var high = parseInt(temperature.length == 4?temperature.substr( 0, 2):temperature.substr( 0, 1));
	var low10 = parseInt(temperature.length == 4?temperature.substr( 2, 1):temperature.substr( 1, 1));
	var low1 = parseInt(temperature.length == 4?temperature.substr( 3, 1):temperature.substr( 2, 1));
	if (low1 > 4)
	{
		low10++;
		if (low10 == 10)
		{
			low10 = 0;
			high++;	
		}
	}
	
	$("#cur_temp").html( high + ","+ low10 + "&deg C");
	setTempToDiv("set_temp", setpoint);
}

function setActiveProgramState()
{
	//First set all inactive?
	for(var i=0; i<4; i++)
		$("#state_"+i).removeClass('ui-btn-sel');
	
	if( (activeState >= 0) &&  (activeState < 4))
		$("#state_"+activeState).addClass('ui-btn-sel');
		
	//Now do the locking :P
	switch(programState)
	{
		case PROG_MANUAL:
		case PROG_HOLIDAY:
		case PROG_MANUALHOLIDAY:
		{
			//Remove all lock info
			$("#modes").removeClass('program');
			for(var i=0; i<4; i++)
				$("#state_"+i).removeClass('lock');
				
			break;
		}
		case PROG_BASE:
		case PROG_TEMPOVERRIDE:
		case PROG_PROGOVERRIDE:
		{
			$("#modes").addClass('program');
			for(var i=0; i<4; i++)
				$("#state_"+i).removeClass('lock');
			break;
		}
		case PROG_LOCKEDBASE:
		{
			$("#modes").addClass('program');
			for(var i=0; i<4; i++)
				$("#state_"+i).addClass('lock');
			
			break;
		}
	}
}

function getStateName(stateId)
{
	switch(stateId)
	{
		case STATE_RELAX:
			return ts("Comfort");
		case STATE_ACTIVE:	
			return ts("At home");
		case STATE_SLEEP:	
			return ts("Sleeping");
		case STATE_AWAY:	
			return ts("Away");
		default:
			return "";
	}
}

function setProgramStateInfo(setpoint)
{
	setActiveProgramState();
	
	//Now the info line
	var lineInfo = "";
	var progName = getStateName(activeState);
	switch(programState)
	{
		case PROG_BASE:
			lineInfo = ts("follow_prog");
			break;
		case PROG_TEMPOVERRIDE:
		case PROG_PROGOVERRIDE:
		{
			if(progName == "")
				lineInfo = ts("weekly_override");
			else
				lineInfo = ts("weekly_override_fav", [progName]);
			break;
		}
		case PROG_HOLIDAY:
		case PROG_MANUALHOLIDAY:
			lineInfo = ts("Vacation");
			break;
		case PROG_MANUAL:
		case PROG_LOCKEDBASE:
		{
			if(progName == "")
				lineInfo = ts("Permanent");
			else
				lineInfo = ts("Permanent_fav", [progName]);
			break;
		}
		default:
			lineInfo = ""; //Don't know what state this is!
	}
	$("#info_line").html(lineInfo);
	
	//Do not set setpoint when user is settings them!
	if(userActive == true)
		return;
		
	currentSetpoint = parseInt(setpoint);
	showFormattedIndoorTemp(currentTemp, currentSetpoint);
}

function setBurnerInfo(newState, otCommError, errorFound)
{
	$("#flame").removeClass('on tap error');
	if(otCommError == "1")
	{
		$("#flame").addClass('error');
		
		$("#error_line").html(ts("ot_comm_err"));
		$("#error_line").show();
		$("#info_line").hide();
	}
	else if( (errorFound != "0") && (errorFound != "255"))
	{
		$("#flame").addClass('error');
		
		//Have an CH error.
		$("#error_line").html(ts("error_found_err", [errorFound]));
		$("#error_line").show();
		$("#info_line").hide();
	}
	else
	{	
		$("#error_line").hide();
		$("#info_line").show();
		if(newState == "1")
		{
			$("#flame").addClass('on');
		}
		else if(newState == "2")
		{
			$("#flame").addClass('tap');
		}
	}
}

function handleThermostatInfo(data)
{
	thermstatInfoT = null;
	if(data && (data.result == "ok"))
	{
		programState = parseInt(data.programState);
		activeState = parseInt(data.activeState);
		currentTemp = data.currentTemp;
		
		//TODO: Do we wan't to do anything with errorCode?
		setBurnerInfo(data.burnerInfo, data.otCommError, data.errorFound);
			
		setProgramStateInfo(data.currentSetpoint);
		thermstatInfoT = setTimeout("getThermostatInfo()", 10000);
	}
	else
	{
		//Error occurred. Return to login page?
//		console.debug("Error occurred. Return to login page?");
	}
}

function setProgramState(pState)
{
	console.debug("setProgramState "+pState);	
	if (programState == PROG_LOCKEDBASE)
	{
		//Always unlock when new state is chosen
		changeSchemeState(PROG_TEMPOVERRIDE, pState);
	}
	else if (programState == PROG_MANUAL)
	{
		changeSchemeState(PROG_MANUAL, pState);
	}
	else
	{
		if (activeState == pState)
		{
//			console.debug("SECONDS PRESS. LOCK");
			changeSchemeState(PROG_LOCKEDBASE, pState);
		}
		else
		{
//			console.debug("FIRST");
			changeSchemeState(PROG_TEMPOVERRIDE, pState);
		}
	}
	activeState = pState;
	setActiveProgramState();
}

function getThermostatInfo()
{
	if(thermstatInfoT != null)
		clearTimeout(thermstatInfoT);

	$.getJSON( THERMOSTAT_INFO_URL, handleThermostatInfo);
}

function changeSchemeState(newState, newSetPointState)
{
	var fullUrl = THERMOSTAT_CHANGE_SS_BASE_URL + "&state="+newState+"&temperatureState="+newSetPointState;
	
	$.getJSON( fullUrl, getThermostatInfo);
}

function sendTempInvoke()
{
	userActive = false;
	
	$.getJSON( SET_TARGET_TEMP_URLCTOR(currentSetpoint), getThermostatInfo);
}

function changeTemp(changeVal)	
{
	userActive = true;
	clearTimeout(setTempT);
	setTempT = setTimeout("sendTempInvoke()",2000);

	currentSetpoint += parseInt(changeVal);	
	
	if(currentSetpoint < 600)
		currentSetpoint = 600;
	if(currentSetpoint > 3000)
		currentSetpoint = 3000;	

	setTempToDiv("cur_temp", currentSetpoint);
}

var inActiveColor = "#EDEDED";
var colorArrayPower = ["#90bd29", "#adc21b", "#cdc21c", "#eac21e", "#fdc221", "#ffb026", "#fa8a2d", "#ec5e35", "#dd353c", "#d6264e"];
var colorArraySolar = ["#ffb789", "#ffa266", "#ff8c42", "#ff761e", "#f96200", "#d65400", "#b24600", "#8e3800", "#6b2a00", "#471c00"];
var colorArrayGas = ["#90bd29", "#adc21b", "#cdc21c", "#eac21e", "#fdc221", "#ffb026", "#fa8a2d", "#ec5e35", "#dd353c", "#d6264e"];
var colorArrayWater = ["#c9f6fe", "#99efff", "#68e8ff", "#37e0ff", "#06d9ff", "#00b4d4", "#008aa3", "#006072", "#003741", "#000d10"];

function fillBlockBar(uType, blocksActive)
{
	var i;
	for(i=0; i<10; i++)
	{
		if (uType == "power" || uType == "elecNT" || uType.indexOf("plug")!=-1){
			if(blocksActive > i)
				$("#"+uType+"_block-"+i).css("background-color", colorArrayPower[i]);
			else
				$("#"+uType+"_block-"+i).css("background-color", inActiveColor);
		}
		
		if (uType == "gas"){
			if(blocksActive > i)
				$("#"+uType+"_block-"+i).css("background-color", colorArrayGas[i]);
			else
				$("#"+uType+"_block-"+i).css("background-color", inActiveColor);
		}
		if (uType == "solarflow" || uType == "solar" || uType == "produflow" || uType == "produNT"){
			if(blocksActive > i)
				$("#"+uType+"_block-"+i).css("background-color", colorArraySolar[i]);
			else
				$("#"+uType+"_block-"+i).css("background-color", inActiveColor);
		}

		if (uType == "waterflow" || uType == "water"){
			if(blocksActive > i)
				$("#"+uType+"_block-"+i).css("background-color", colorArrayWater[i]);
			else
				$("#"+uType+"_block-"+i).css("background-color", inActiveColor);
		}

	}
}


function setUsageInfo(uType, uValue, avgValue)
{
	if(uValue)
	{
		$("#cur_"+uType).html(uValue);
		//Avg is 3 blocks
		var blockStep = avgValue / 3;
		var blocksActive = Math.round(uValue / blockStep);
		fillBlockBar(uType, blocksActive);
	}
	else
	{
		$("#cur_"+uType).html("0");
		fillBlockBar(uType, 0);
	}
}


function togglePlug(a, newstate)
{
	var fullUrl = "/hdrv_zwave?action=basicCommand&uuid=" + plugUUIDS[a] + "&state=";

	if (plugSTATES[a]=="1"){
		$("#img_plug"+a + "_1").attr('src', "themes/images/WallSocket48_Off.png");
		$.getJSON( fullUrl + "0");
	}else{
		$("#img_plug"+a + "_1").attr('src', "themes/images/WallSocket48_On.png");
		$.getJSON( fullUrl + "1");
	}
	setTimeout(function () { getnewStatus(a); }, 1000);

	
}

function getnewStatus(a)
{
	var fullUrl = "/hdrv_zwave?action=GetBasic&waitForReponse=0&timeout=120&&uuid=" + plugUUIDS[a];
	$.getJSON( fullUrl );
}


function handlePlugsInfo(data)
{		var a = 1;
		var b = 1;
		plugsAvailable = 0;		
		detectorsAvailable = 0;						   
		for(var i=1; i<plugSTATES.length; i++){
			$('#plug' + i).hide();
		}
		for(var i=1; i<=9; i++){
			$('#detector' + i).hide();
		}
		for (var detector in data) {
			if (detector != "dev_settings_device"){
				if (data[detector].type =="FGSD002"){
					detectorsAvailable = 1;
					if (data[detector].IsConnected =="1" && !isNaN(data[detector].CurrentTemperature)){
						$("#img_connected_detector"+b).attr('src', "themes/images/good.png");
						$("#connected_detector"+b).html("Verbonden");
						$("#batt_detector"+b).html(data[detector].CurrentBatteryLevel);
						$("#temp_detector"+b).html(data[detector].CurrentTemperature + "&#x00B0;C");
						$("#img_temp_detector"+b).attr('src', "themes/images/temperatureLoggerTray_black.png");
						
						if (data[detector].TamperingDetected =="0"){
							$("#img_tamper_detector"+b).attr('src', "themes/images/good.png");
							$("#tampered_detector"+b).html("Tamper OK");
						}else{
							$("#img_tamper_detector"+b).attr('src', "themes/images/bad.png");
							$("#tampered_detector"+b).html("Tamper Fout!");
						}
						
						if (data[detector].AlarmStatus =="clear"){
							$("#img_smoke_detector"+b).attr('src', "themes/images/smokedetector-systray.png");
							$("#alarm_detector"+b).html("Geen alarm");
						}
						
						if (data[detector].AlarmStatus =="alarm"){
							$("#img_smoke_detector"+b).attr('src', "themes/images/smokedetector.png");
							$("#alarm_detector"+b).html("ALARM!!!");
						}
						
						if (data[detector].AlarmStatus =="testalarm"){
							$("#img_smoke_detector"+b).attr('src', "themes/images/smokedetector.png");
							$("#alarm_detector"+b).html("Test");
						}
						
						if(data[detector].CurrentBatteryLevel <0){
							$("#img_batt_detector"+b).attr('src', "themes/images/battery-low.png");
							$("#batt_detector"+b).html("XXX");
						}
						
						if(data[detector].CurrentBatteryLevel >=0 && data[detector].CurrentBatteryLevel <40){
							$("#img_batt_detector"+b).attr('src', "themes/images/battery-low.png");
						}
						if(data[detector].CurrentBatteryLevel >=40 && data[detector].CurrentBatteryLevel <75){
							$("#img_batt_detector"+b).attr('src', "themes/images/battery-mid.png");
						}	
						if(data[detector].CurrentBatteryLevel >=75 && data[detector].CurrentBatteryLevel <90){
							$("#img_batt_detector"+b).attr('src', "themes/images/battery-high.png");
						}	
						if(data[detector].CurrentBatteryLevel >=90){
							$("#img_batt_detector"+b).attr('src', "themes/images/battery-full.png");
						}
					
					}else{
						$("#img_connected_detector"+b).attr('src', "themes/images/bad.png");
						$("#connected_detector"+b).html("Niet verbonden");
						$("#img_tamper_detector"+b).attr('src', "themes/images/empty.png");
						$("#img_smoke_detector"+b).attr('src', "themes/images/empty.png");
						$("#alarm_detector"+b).html("");
						$("#tampered_detector"+b).html("");
						$("#img_temp_detector"+b).attr('src', "themes/images/empty.png");
						$("#temp_detector"+b).html("");
						$("#batt_detector"+b).html("0");
						$("#img_batt_detector"+b).attr('src', "themes/images/battery-unknown.png");
					}
					
					for (var nr in detectorUUIDS){
						if (detectorUUIDS[nr] == data[detector].uuid){
							$("#name_detector"+b).html(detectorNAMES[nr]);
						}
					}
					$("#detector"+b).show();
					b++;
				}
			}
		}
		
		if (detectorsAvailable == 0){
			$('#dot_15').hide();
			$('#dot_25').hide();
			$('#dot_35').hide();
			$('#dot_45').hide();
			$('#dot_55').hide();
			$('#dot_65').hide();
		}
		else{
			$('#dot_15').show();
			$('#dot_25').show();
			$('#dot_35').show();
			$('#dot_45').show();
			$('#dot_55').show();
			$('#dot_65').show();
		}
					 
		
		for (var key in data) {
			if (key != "dev_settings_device"){
				if (data[key].type =="FGWPF102" || data[key].type =="ZMNHYD1" || data[key].type =="FGWP011" || data[key].type =="NAS_WR01Z" || data[key].type =="NAS_WR01ZE" || data[key].type =="NAS_WR02ZE" || data[key].type =="EMPOWER"  || data[key].type =="EM6550_v1"){
					plugsAvailable = 1;
					
					$("#name_plug"+a).html(data[key].name);
					$("#plug"+a).show();
					
					if (data[key].IsConnected =="1"){
						$("#name_plug"+a).removeClass("plug-title-nf");
						$("#us_plug"+a).removeClass("usage-nf");
						$("#img_plug"+a + "_2").attr('src', "themes/images/empty.png");
						if (data[key].TargetStatus == "1"  || data[key].CurrentState == "1"){
							plugSTATES[a] = "1";
							$("#img_plug"+a + "_1").attr('src', "themes/images/WallSocket48_On.png");
						}else{
							plugSTATES[a] = "0";
							$("#img_plug"+a + "_1").attr('src', "themes/images/WallSocket48_Off.png");
						}
					}else{
						$("#name_plug"+a).addClass("plug-title-nf");
						$("#us_plug"+a).addClass("usage-nf");
						$("#img_plug"+a + "_2").attr('src', "themes/images/empty.png");
						plugSTATES[a] = "0";
						$("#img_plug"+a + "_1").attr('src', "themes/images/WallSocket48_NF.png");
					}

					plugUUIDS[a] = data[key].uuid;
					var CurrentElectricityFlow = data[key].CurrentElectricityFlow;
					if (isNaN(CurrentElectricityFlow) || data[key].IsConnected !="1")CurrentElectricityFlow = 0;
					setUsageInfo("plug" + a , CurrentElectricityFlow, 750);
					a++;
				}
			}
		}
		if (plugsAvailable == 0){
			$('#dot_14').hide();
			$('#dot_24').hide();
			$('#dot_34').hide();
			$('#dot_44').hide();
			$('#dot_54').hide();
			$('#dot_64').hide();
		}
		else{
			$('#dot_14').show();
			$('#dot_24').show();
			$('#dot_34').show();
			$('#dot_44').show();
			$('#dot_54').show();
			$('#dot_64').show();
		}
		
		plugsInfoT = setTimeout("getPlugsInfo()", 10000);
}






function handleTemperatureInfo(data)
{		temperatureAvailable = 0;
		for(var i=1; i<temperatureNAMES.length; i++){
			$('#temperature' + i).hide();
		}
		
		var nr = 1;
		
		var devices = data.split("\n");
		for (var devicenr in devices) {
			if(devices[devicenr] !=""){
				var deviceArray = devices[devicenr].split("-@@-");
				$("#name_temperature"+nr).html("&nbsp;" + deviceArray[0]);
				$("#data_temp"+nr).html(deviceArray[1]);
				if(deviceArray[2] == "degr") {
					$("#data_temp"+nr).html(deviceArray[1] + "&#x00B0;C");
				}else{
					$("#data_temp"+nr).html(deviceArray[1] + " " + deviceArray[2]);
				}	
				if(deviceArray[3] != null) {
					$("#hygr_temp"+nr).html(deviceArray[3] + "%");
					$("#hygr_temp"+nr).show();
				}else{
					$("#hygr_temp"+nr).hide();
				}
				$("#temperature"+nr).show();
				temperatureAvailable = 1;
				nr++;
			}
		}
		if (temperatureAvailable == 0){
			$('#dot_16').hide();
			$('#dot_26').hide();
			$('#dot_36').hide();
			$('#dot_46').hide();
			$('#dot_56').hide();
			$('#dot_66').hide();
		}
		else{
			$('#dot_16').show();
			$('#dot_26').show();
			$('#dot_36').show();
			$('#dot_46').show();
			$('#dot_56').show();
			$('#dot_66').show();
		}
		temperatureInfoT = setTimeout("getTemperatureInfo()", 10000);
}


function handlePwrusageInfo(data)
{
	if(data && (data.result == "ok"))
	{
		if(data.powerUsage)
			setUsageInfo("power", data.powerUsage.value, data.powerUsage.avgValue);
		pwrusageInfoT = setTimeout("getPwrusageInfo()", 10000);
	}
	else
	{
		//Error occurred. Return to login page?
//		console.debug("Error occurred. Return to login page?");
	}
}

function handleElecLTInfo(data)
{
	var $value1 = -1;
	var $value2 = -1;
	var $total = 0;
	var $numberofitems = 0;
	var $average = 1000;
	for (var $key in data) {
		if (data[$key] != -1 && data[$key] != null) {
			$value2 = $value1;
			$value1 = data[$key];
			if ($value2 != -1 ) {
				$total = $total + $value1 - $value2;
				$numberofitems++;
			}
		}
	}
	$average = Math.round($total/$numberofitems);
	elecTotalAVG = $average;
	getElecNTInfo();
}


function handleElecNTInfo(data)
{
	var $value1 = -1;
	var $value2 = -1;
	var $total = 0;
	var $numberofitems = 0;
	var $average = 1000;
	for (var $key in data) {
		if (data[$key] != -1 && data[$key] != null) {
			$value2 = $value1;
			$value1 = data[$key];
			if ($value2 != -1 ) {
				$total = $total + $value1 - $value2;
				$numberofitems++;
			}
		}
	}
	$average = Math.round($total/$numberofitems);
	elecTotalAVG =  Math.max(elecTotalAVG,$average);
	getElecLT_HRS_Info();
}


function handleElecLT_HRS_Info(data)
{
	var $value1 = -1;
	var $value2 = -1;

	var i=0;
	//console.log("handleElecLT_HRS_Info");
	//console.log(data);
	
	for (var $key in data) {
		if (i==0){
			if (data[$key] != -1 && data[$key] != null) {
				$value1 = data[$key] ;
				//console.log("data1: " + $value1);
			}
		}
		i++;
		if (data[$key] != -1 && data[$key] != null) {
			$value2 = data[$key] ;
			//console.log("data2: " + $value2);
		}
	}
	elecTotalToday = $value2 - $value1;
	//console.log("elecTotalToday1: " + elecTotalToday);
	if (isNaN(elecTotalToday))elecTotalToday = 0;
	getElecNT_HRS_Info(elecTotalToday);
}


function handleElecNT_HRS_Info(data)
{
	var $value1 = -1;
	var $value2 = -1;

	var i=0;
	//console.log("handleElecNT_HRS_Info");
	//console.log(data);
	
	for (var $key in data) {
		if (i==0){
			if (data[$key] != -1 && data[$key] != null) {
				$value1 = data[$key] ;
				//console.log("data1: " + $value1);
			}
		}
		i++;
		if (data[$key] != -1 && data[$key] != null) {
			$value2 = data[$key] ;
			//console.log("data2: " + $value2);
		}
	}
	var electic2 = $value2 - $value1;
	if (isNaN(electic2))electic2 = 0;
	elecTotalToday = elecTotalToday + electic2 ;
	
	if (isNaN(elecTotalToday))elecTotalToday = 0;
    //console.log("elecTotalToday2 : " + elecTotalToday);   

    setUsageInfo("elecNT", Math.round(elecTotalToday/10) / 100 , elecTotalAVG/1000 );
    elecLTInfoT = setTimeout("getElecLTInfo()", 10000);   //cycle to the LT

}



function handleSolarFlowInfo(data)
{
	var $current = 0;
	var $max = 100;
	var i=0;
	for (var $key in data) {
		i++;
		if (data[$key] != -1 && data[$key] != null) {
			if($max < data[$key] && i<=288) $max =  data[$key]; //find max value but only yesterday
			$current = data[$key] ;
		}
	}
	if (isNaN($current)){
			$current = 0;
			solarAvailable = 0;
			$('#dot_13').hide();
			$('#dot_23').hide();
			$('#dot_33').hide();
			$('#dot_43').hide();
			$('#dot_53').hide();
		}
		else{
			solarAvailable = 1;
			$('#dot_13').show();
			$('#dot_23').show();
			$('#dot_33').show();
			$('#dot_43').show();
			$('#dot_53').show();
		}
	setUsageInfo("solarflow", $current , $max/3 );
	solarInfoT = setTimeout("getSolarFlowInfo()", 10000);
}


























function handleSolarNowInfo(data)
{
	var $value = -1;
	var $total = 0;
	var $numberofitems = 0;
	var $average = 1000;
	for (var $key in data) {
		if (data[$key] != -1 && data[$key] != null) {
			$value = data[$key];
		}
	}
	solarNow  = Math.round($value*10/10);
	console.log("nu = " + solarNow)
	getSolarInfo();

}

function handleSolarInfo(data)
{
	var $value1 = -1;
	var $value2 = -1;
	var $total = 0;
	var $numberofitems = 0;
	var $average = 1000;
	var $todayvalue = -1;
	for (var $key in data) {
		if (data[$key] != -1 && data[$key] != null) {
			$value2 = $value1;
			$value1 = data[$key];
			if ($value2 != -1 ) {
				$total = $total + $value1 - $value2;
				$numberofitems++;
			}
		}
	}
	
	$average = Math.round(($total/$numberofitems)/1000);
	solarTotalAVG = $average ;

	for (var $key in data) {
		$value2 = $value1;
		if (data[$key] != -1 && data[$key] != null) {
			$value1 = data[$key];
		}
	}
	console.log("Yesterday end value = " + $value2)
	var todaySolar = Math.round((solarNow - $value2)/10) / 100;
	console.log("Today solar = " + todaySolar)
	if (todaySolar >-1)setUsageInfo("solar", todaySolar , solarTotalAVG );
	//setUsageInfo("solar", todaySolar , solarTotalAVG );
	solarInfoT = setTimeout("getSolarNowInfo()", 10000);
}


















function handleProduFlowInfo(data)
{
	var $current = 0;
	var $max = 100;
	var i=0;
	for (var $key in data) {
		i++;
		if (data[$key] != -1 && data[$key] != null) {
			if($max < data[$key] && i<=288) $max =  data[$key]; //find max value but only yesterday
			$current = data[$key] ;
		}
	}
	if (isNaN($current))$current = 0;
	setUsageInfo("produflow", $current , $max );
	solarInfoT = setTimeout("getProduFlowInfo()", 10000);
}


function handleProduLTInfo(data)
{
	var $value1 = -1;
	var $value2 = -1;
	var $total = 0;
	var $numberofitems = 0;
	var $average = 1000;
	for (var $key in data) {
		if (data[$key] != -1 && data[$key] != null) {
			$value2 = $value1;
			$value1 = data[$key];
			if ($value2 != -1 ) {
				$total = $total + $value1 - $value2;
				$numberofitems++;
			}
		}
	}
	$average = Math.round($total/$numberofitems);
	produTotalToday = $value1 - $value2;
	if (isNaN(produTotalToday))produTotalToday = 0;
	produTotalAVG = $average;
	getProduNTInfo();
}

function handleProduNTInfo(data)
{
	var $value1 = -1;
	var $value2 = -1;
	var $total = 0;
	var $numberofitems = 0;
	var $average = 1000;
	for (var $key in data) {
		if (data[$key] != -1 && data[$key] != null) {
			$value2 = $value1;
			$value1 = data[$key];
			if ($value2 != -1 ) {
				$total = $total + $value1 - $value2;
				$numberofitems++;
			}
		}
	}
	
	$average = Math.round($total/$numberofitems);
	var produ2 = $value1 - $value2;
	if (isNaN(produ2))produ2 = 0;
	produTotalToday = produTotalToday + produ2 ;
	produTotalAVG  =  Math.max(produTotalAVG ,$average);
	//setUsageInfo("produNT", Math.round(produTotalToday/10) / 100 , produTotalAVG/1000 );
    setUsageInfo("produNT", Math.round(produTotalToday/10) / 100 , solarTotalAVG );

	produLTInfoT = setTimeout("getProduLTInfo()", 10000);   //cycle to the LT
}


function handleGasusageInfo(data)
{
	//console.log("handleGas_HRS_Info");
	//console.log(data);
	var $value1 = -1;
	var $value2 = -1;
	var $total = 0;
	var $numberofitems = 0;
	var $average = 1000;
	var $found = "placeholder";
	for (var $key in data) {
		if (data[$key] != -1 && data[$key] != null) $found = data[$key];
		$value2 = $value1;
		$value1 = data[$key];
		if ($value2 != -1) {
			$total = $total + $value1 - $value2;
			$numberofitems++;
		}
	}
	if (isNaN($found)){
		$("#gas").hide();
	}
	else{
		$("#gas").show();
	}
	$average = Math.round($total/$numberofitems);
	gasTotalAVG = $average;
	getGAS_HRS_Info();
}


function handleGasusage_HRS_Info(data)
{
	var $value1 = -1;
	var $value2 = -1;

	var i=0;
	//console.log("handleGas_HRS_Info");
	//console.log(data);
	
	for (var $key in data) {
		if (i==0){
			if (data[$key] != -1 && data[$key] != null) {
				$value1 = data[$key] ;
				//console.log("data1: " + $value1);
			}
		}
		i++;
		if (data[$key] != -1 && data[$key] != null) {
			$value2 = data[$key] ;
			//console.log("data2: " + $value2);
		}
	}
	var gas2 = $value2 - $value1;
	if (isNaN(gas2))gas2 = 0;
	gasTotalToday = gas2 ;
	
	if (isNaN(gasTotalToday))gasTotalToday = 0;
    //console.log("gasTotalToday2 : " + gasTotalToday);   

    setUsageInfo("gas", Math.round(gasTotalToday/10) / 100 , gasTotalAVG/1000);
    gasInfoT = setTimeout("getGasusageInfo()", 10000);
}


function handleWaterFlowInfo(data)
{
	var $current = 0;
	var $max = "placeholder";
	var i=0;
	for (var $key in data) {
		i++;
		if (data[$key] != -1 && data[$key] != null) {
			//console.log(data[$key]);
			if(($max < data[$key] && i<=288) || $max == "placeholder") $max =  data[$key]; //find max value but only yesterday
			$current = data[$key] ;
		}
	}
	if (isNaN($current))$current = 0;
	if (isNaN($max)){
		$("#water").hide();
		$("#waterflow").hide();
	}
	else{
		$("#water").show();
		$("#waterflow").show();
	}
	waterInfoT = setTimeout("getWaterFlowInfo()", 5000);
}

function handleWaterInfo(data)
{
	//console.log("waterdata " + data)
	if(data && (data.result == "ok"))

	{
		if(data.water)
			//console.log("waterflow " + data.water.flow)
		    //console.log("water "  + data.water.value)
			setUsageInfo("waterflow", data.water.flow , 5 );
			setUsageInfo("water", data.water.value, data.water.avgValue);
			waterInfoT = setTimeout("getWaterInfo()", 10000);
	}
	else
	{
		//Error occurred. Return to login page?
//		console.debug("Error occurred. Return to login page?");
	}
}


function handleSensorInfo(data)
{
	//console.log("sensordata " + data)
	if(data){
			$("#sensors").show();
			$("#sensor1").html(data.humidity + " %");
			$("#sensor2").html(data.tvoc  + " ppm");
			$("#sensor3").html(data.eco2  + " ppm");
			$("#sensor4").html(data.intensity  + " lux");
	}
	else{
		 $("#sensors").hide();
	}
}


function getPwrusageInfo()
{
	if(pwrusageInfoT != null)
		clearTimeout(pwrusageInfoT);
	$.getJSON( PWRUSAGE_INFO_URL, handlePwrusageInfo);
}

function getPowerInfo()
{
	if(powerInfoT != null)
		clearTimeout(powerInfoT);
		var $date = new Date();
		$date.setDate($date.getDate()-2);
		var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear();
	$.getJSON( PWRUSAGE_DAY_URL + $yesterday, handlePowerInfo);
}

function getElecLTInfo()
{
	if(elecLTInfoT != null)
		clearTimeout(elecLTInfoT);
		var $date = new Date();
		$date.setDate($date.getDate()-10);
		var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear();
	$.getJSON( ELEC_INFO_LT_URL + $yesterday, handleElecLTInfo);
}

function getElecNTInfo()
{
	if(elecNTInfoT != null)
		clearTimeout(elecNTInfoT);
		var $date = new Date();
		$date.setDate($date.getDate()-10);
		var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear();
	$.getJSON( ELEC_INFO_NT_URL + $yesterday, handleElecNTInfo);
}


function getElecLT_HRS_Info()
{
	var $date = new Date();
	$date.setDate($date.getDate()-1);
	var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear() + ' 23:00:00';
	const unixTime = Date.parse($yesterday);
	//console.log("unixTime: " + unixTime);
	$.getJSON(ELEC_INFO_LT_hrs_URL + $yesterday, handleElecLT_HRS_Info);
}


function getElecNT_HRS_Info()
{
	var $date = new Date();
	$date.setDate($date.getDate()-1);
	var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear() + ' 23:00:00';
	const unixTime = Date.parse($yesterday);
	//console.log("unixTime: " + unixTime);
	$.getJSON(ELEC_INFO_NT_hrs_URL + $yesterday, handleElecNT_HRS_Info);
}



function getGasusageInfo()
{
	if(gasusageInfoT != null)
		clearTimeout(gasusageInfoT);
		var $date = new Date();
		$date.setDate($date.getDate()-10);
		var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear();
	$.getJSON( GASUSAGE_INFO_URL + $yesterday, handleGasusageInfo);

}

function getGAS_HRS_Info()
{
	var $date = new Date();
	$date.setDate($date.getDate()-1);
	var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear() + ' 23:00:00';
	const unixTime = Date.parse($yesterday);
	//console.log("unixTime: " + unixTime);
	$.getJSON(GASUSAGE_INFO_hrs_URL + $yesterday, handleGasusage_HRS_Info);
}


function getSolarFlowInfo()
{
	if(solarFlowInfoT != null)
		clearTimeout(solarFlowInfoT);
		var $date = new Date();
		$date.setDate($date.getDate()-1);
		var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear();
		//2 days history
	$.getJSON( SOLARFLOW_INFO_URL + $yesterday, handleSolarFlowInfo);
}

function getSolarNowInfo()
{
	if(solarInfoNowT != null)clearTimeout(solarInfoNowT);
	var $date = new Date();
	$date.setDate($date.getDate()-10);
	var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear();
	console.log(SOLAR_INFONOW_URL + $yesterday)
	$.getJSON( SOLAR_INFONOW_URL + $yesterday, handleSolarNowInfo);
}


function getSolarInfo()
{
	if(solarInfoT != null)clearTimeout(solarInfoT);
		var $date = new Date();
		$date.setDate($date.getDate()-10);
		var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear();
		console.log(SOLAR_INFO_URL + $yesterday)
	$.getJSON( SOLAR_INFO_URL + $yesterday, handleSolarInfo);
}

function getProduFlowInfo()
{
	if(produFlowInfoT != null)
		clearTimeout(produFlowInfoT);
		var $date = new Date();
		$date.setDate($date.getDate()-1);
		var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear();
		//2 days history
	$.getJSON( PRODUFLOW_INFO_URL + $yesterday, handleProduFlowInfo);
}

function getProduLTInfo()
{
	if(produLTInfoT != null)
		clearTimeout(produLTInfoT);
		var $date = new Date();
		$date.setDate($date.getDate()-10);
		var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear();
	$.getJSON( PRODU_INFO_LT_URL + $yesterday, handleProduLTInfo);
}

function getProduNTInfo()
{
	if(produNTInfoT != null)
		clearTimeout(produNTInfoT);
		var $date = new Date();
		$date.setDate($date.getDate()-10);
		var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear();
	$.getJSON( PRODU_INFO_NT_URL + $yesterday, handleProduNTInfo);
}

function getWaterFlowInfo()
{
	if(waterFlowInfoT != null)
		clearTimeout(waterFlowInfoT);
		var $date = new Date();
		$date.setDate($date.getDate()-1);
		var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear();
		//2 days history
	$.getJSON( WATERFLOW_INFO_URL + $yesterday, handleWaterFlowInfo);
}


function getWaterInfo()
{
		if(waterInfoT != null)
		clearTimeout(waterInfoT);
		$.getJSON( WATER_INFO_URL, handleWaterInfo);
}

function getSensorInfo()
{
		if(sensorInfoT != null)
		clearTimeout(sensorInfoT);
		$.getJSON( SENSOR_INFO_URL, handleSensorInfo);
}


function getPlugsInfo()
{
	if(plugsInfoT != null)
		clearTimeout(plugsInfoT);
	$.getJSON( PLUGS_INFO_URL, handlePlugsInfo);
}


function getTemperatureInfo()
{
	if(temperatureInfoT != null)
		clearTimeout(temperatureInfoT);
	$.get(TEMPERATURE_INFO_URL, handleTemperatureInfo);
}


function handleThermostatStates(data)
{
	if(data)
	{
		if(data.result != "error")
		{
			var sts = data.states[0].state;
			for(var elm in sts)
			{
				var state = sts[elm];
				setTempToDiv("modeTemp-"+state.id, state.tempValue);
			}
		}
	}
}

function getThermostatStates()
{
	$.getJSON( THERMOSTAT_STATES, handleThermostatStates);
}
