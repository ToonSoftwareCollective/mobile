//Various programStates
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

var produTotalToday = 0;
var produTotalAVG = 0;


var THERMOSTAT_STATES = "/hcb_config?action=getObjectConfigTree&package=happ_thermstat&internalAddress=thermostatStates";
var PWRUSAGE_INFO_URL = "/happ_pwrusage?action=GetCurrentUsage";

var ELEC_INFO_LT_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_quantity_lt&rra=10yrdays&readableTime=1&nullForNaN=1&from=";
var ELEC_INFO_NT_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_quantity_nt&rra=10yrdays&readableTime=1&nullForNaN=1&from=";

var GASUSAGE_INFO_URL = "/hcb_rrd?action=getRrdData&loggerName=gas_quantity&rra=10yrdays&readableTime=1&nullForNaN=1&from=";

var SOLAR_INFO_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_solar_quantity&rra=10yrdays&readableTime=1&nullForNaN=1&from=";
var SOLARFLOW_INFO_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_solar_flow&rra=5min&readableTime=1&nullForNaN=1&from=";
var PRODUFLOW_INFO_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_produ_flow&rra=5min&readableTime=1&nullForNaN=1&from=";


var PRODU_INFO_LT_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_quantity_lt_produ&rra=10yrdays&readableTime=1&nullForNaN=1&from=";
var PRODU_INFO_NT_URL = "/hcb_rrd?action=getRrdData&loggerName=elec_quantity_nt_produ&rra=10yrdays&readableTime=1&nullForNaN=1&from=";


//var WATERUSAGE_INFO_URL =  "water_mobile.json";
var WATERUSAGE_INFO_URL =  "/hcb_rrd?action=getRrdData&loggerName=water_quantity&rra=10yrhours&readableTime=1&nullForNaN=1&from=";
var WATERFLOW_INFO_URL = "/hcb_rrd?action=getRrdData&loggerName=water_flow&rra=5min&readableTime=1&nullForNaN=1&from=";


var THERMOSTAT_INFO_URL = "/happ_thermstat?action=getThermostatInfo";
var THERMOSTAT_CHANGE_SS_BASE_URL = "/happ_thermstat?action=changeSchemeState";
var SET_TARGET_TEMP_URLCTOR				= function(setpoint) { return "/happ_thermstat?action=roomSetpoint&Setpoint=" + setpoint; };
var thermstatInfoT = null;
var pwrusageInfoT = null;
var elecLTInfoT = null;
var elecNTInfoT = null;

var gasusageInfoT = null;
var solarInfoT = null;
var solarFlowInfoT = null;
var produFlowInfoT = null;

var produLTInfoT = null;
var produNTInfoT = null;
var waterusageInfoT = null;
var waterFlowInfoT = null;
var setTempT = null;

var userActive = false;

var activeState = -1;
var currentTemp = 0;
var currentSetpoint = 0;
var programState = 0;

function initPage()
{
	$.hcb.translatePage();
		
	//If we are local we don't need to login
	if(jQuery.hcb.proxy.supported == false)
	{
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
	clearTimeout(solarFlowInfoT);
	clearTimeout(produFlowInfoT);
	clearTimeout(produNTInfoT);
	clearTimeout(pwrusageInfoT);
	clearTimeout(waterFlowInfoT);
	
	pwrusageInfoT = null;
	elecLTInfoT = null;
	elecNTInfoT = null;
	gasusageInfoT = null;
	solarInfoT = null;
	solarFlowInfoT = null;
	produFlowInfoT = null;
	produLTInfoT = null;
	produNTInfoT = null;
	waterusageInfoT = null;
	waterFlowInfoT = null;

	clearTimeout(setTempT);	
	setTempT = null;
	clearTimeout(thermstatInfoT);	
	thermstatInfoT = null;
	
	$.mobile.changePage("#login");
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
	getThermostatInfo()
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
	getWaterusageInfo();
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
	if(getWaterusageInfo != null)
		clearTimeout(getWaterusageInfo);
	if(getWaterFlowInfo != null)
		clearTimeout(getWaterFlowInfo);
}


function solarPageLoaded()
{
	getSolarInfo();
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
		if (uType == "power"){
			if(blocksActive > i)
				$("#"+uType+"_block-"+i).css("background-color", colorArrayPower[i]);
			else
				$("#"+uType+"_block-"+i).css("background-color", inActiveColor);
		}
		if (uType == "elecNT"){
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
		if (uType == "solarflow"){
			if(blocksActive > i)
				$("#"+uType+"_block-"+i).css("background-color", colorArraySolar[i]);
			else
				$("#"+uType+"_block-"+i).css("background-color", inActiveColor);
		}
		if (uType == "solar"){
			if(blocksActive > i)
				$("#"+uType+"_block-"+i).css("background-color", colorArraySolar[i]);
			else
				$("#"+uType+"_block-"+i).css("background-color", inActiveColor);
		}
		if (uType == "produflow"){
			if(blocksActive > i)
				$("#"+uType+"_block-"+i).css("background-color", colorArraySolar[i]);
			else
				$("#"+uType+"_block-"+i).css("background-color", inActiveColor);
		}
		if (uType == "produNT"){
			if(blocksActive > i)
				$("#"+uType+"_block-"+i).css("background-color", colorArraySolar[i]);
			else
				$("#"+uType+"_block-"+i).css("background-color", inActiveColor);
		}
		if (uType == "waterflow"){
			if(blocksActive > i)
				$("#"+uType+"_block-"+i).css("background-color", colorArrayWater[i]);
			else
				$("#"+uType+"_block-"+i).css("background-color", inActiveColor);
		}
		if (uType == "water"){
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
	$average = Math.round(($total/$numberofitems)/1000);
	elecTotalToday = $value1 - $value2;
	elecTotalAVG = $average;
	//setUsageInfo("elecLT", Math.round(($value1 - $value2)/10) / 100 , $average );
	getElecNTInfo(elecTotalToday, elecTotalAVG);
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
	$average = Math.round(($total/$numberofitems)/1000);
	elecTotalToday = elecTotalToday + ($value1 - $value2) ;
	elecTotalAVG =  Math.max(elecTotalAVG,$average);
	setUsageInfo("elecNT", Math.round(elecTotalToday/10) / 100 , elecTotalAVG );
	elecLTInfoT = setTimeout("getElecLTInfo()", 10000);   //cycle to the LT
}

function handleGasusageInfo(data)
{
	var $value1 = -1;
	var $value2 = -1;
	var $total10days = 0;
	for (var $key in data) {
		$value2 = $value1;
		$value1 = data[$key];
		if ($value2 != -1) $total10days = $total10days + $value1 - $value2;
	}
	setUsageInfo("gas", Math.round(($value1 - $value2)/10) / 100 , $total10days / 10000);
	gasusageInfoT = setTimeout("getGasusageInfo()", 10000);
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
	if (isNaN($current))$current = 0;
	setUsageInfo("solarflow", $current , $max/3 );
	solarInfoT = setTimeout("getSolarFlowInfo()", 10000);
}

function handleSolarInfo(data)
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
	$average = Math.round(($total/$numberofitems)/1000);
	setUsageInfo("solar", Math.round(($value1 - $value2)/10) / 100 , $average );
	solarInfoT = setTimeout("getSolarInfo()", 10000);
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
	$average = Math.round(($total/$numberofitems)/1000);
	produTotalToday = $value1 - $value2;
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

	$average = Math.round(($total/$numberofitems)/1000);
	produTotalToday = produTotalToday + ($value1 - $value2) ;
	produTotalAVG  =  Math.max(produTotalAVG ,$average);
	setUsageInfo("produNT", Math.round(produTotalToday/10) / 100 , produTotalAVG/1000 );
	produLTInfoT = setTimeout("getProduLTInfo()", 10000);   //cycle to the LT
}

function handleWaterFlowInfo(data)
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
	setUsageInfo("waterflow", $current , $max/3 );
	waterInfoT = setTimeout("getWaterFlowInfo()", 5000);
}

function handleWaterusageInfo(data)
{
	var $value1 = -1;
	var $value2 = -1;
	var $end = 0;
	var $endindex = 0;
	var $start = 0;
	var $startindex = 0;
	var $numberofitems = 0;
	var $average = 1000;
	var i=0;
	for (var $key in data) {
		i++;
		
		if (data[$key] != -1 && data[$key] != null && data[$key] > 0 && $start == 0) {
			$start = data[$key];
			$startindex = i;
		}	
		
		if (i<=96){
			if (data[$key] != -1 && data[$key] != null && $start > 0) {
					$end = data[$key];
					$endindex = i;
				}	
		}
		if (i>96){
			if (data[$key] != -1 && data[$key] != null && data[$key] > $value1){
				if ($value2 == -1) {
					$value2 = data[$key];
				}
				
				$value1 = data[$key];
			}
		}
	}
	$average = Math.round(($end-$start)/(($endindex-$startindex)/24));
	//console.log($average);
	setUsageInfo("water", Math.round(($value1 - $value2)) , $average );
	waterusageInfoT = setTimeout("getWaterusageInfo()", 10000);
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


function getGasusageInfo()
{
	if(gasusageInfoT != null)
		clearTimeout(gasusageInfoT);
		var $date = new Date();
		$date.setDate($date.getDate()-10);
		var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear();
	$.getJSON( GASUSAGE_INFO_URL + $yesterday, handleGasusageInfo);

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


function getSolarInfo()
{
	if(solarInfoT != null)
		clearTimeout(solarInfoT);
		var $date = new Date();
		$date.setDate($date.getDate()-10);
		var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear();
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

function getWaterusageInfo()
{
	if(waterusageInfoT != null)
		clearTimeout(waterusageInfoT);
		var $date = new Date();
		$date.setDate($date.getDate()-5);
		var $yesterday = $date.getDate() + '-' + ($date.getMonth()+1) + '-' + $date.getFullYear() + " 23:00:00";		
	$.getJSON( WATERUSAGE_INFO_URL + $yesterday, handleWaterusageInfo);
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
