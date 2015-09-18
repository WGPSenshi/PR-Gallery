//@formatter:off Telling Aptana to not mess up this array
var DICTIONARY_SMALL = [
	["gpm_insurgency", "Ins."],
    ["gpm_skirmish", "Skir."],
    ["gpm_cq", "AAS"],
    ["16", "Inf."],
    ["32", "Alt."],
    ["64", "Std."],
    ["128", "Lrg."]
];

var DICTIONARY_LARGE = [["gpm_insurgency", "Insurgency"],
    ["gpm_skirmish", "Skirmish"],
    ["gpm_cq", "AAS"],
    ["gpm_cnc", "Cnc"],
    ["gpm_coop", "Co-Op"],
    ["gpm_vehicles", "Vehi. Warfare"],
    
    ["16", "Infantry"],
    ["32", "Alternative"],
    ["64", "Standard"],
    ["128", "Large"],
    
    ["cf", "Canadian Forces"],
    ["ch", "Chinese Forces"],
    ["chinsurgent", "Militia"],
    ["fr", "French Forces"],
    ["gb", "British Armed Forces"],
    ["ger", "German Forces"],
    ["hamas", "Hamas"],
    ["idf", "Israeli Defence Forces"],
    ["mec", "Middle East Coalition"],
    ["meinsurgent", "Iraqi Insurgents"],
    ["ru", "Russian Armed Forces"],
    ["taliban", "Taliban"],
    ["us", "United States Marine Corps"],
    ["usa", "United States Army"],
    ["ww2ger", "Wehrmacht"],
    ["ww2usa", "United States Army"],
    ["vnnva", "North Vietnamese Army"],
    ["vnusa", "Unite dStates Army"],
    ["vnusmc", "United States Marine Corps"],
    ["vnvc", "Viet Cong"],
    ["arg82", "Argentine Armed Forces"],
    ["gb82", "British Armed Forces"],
    ["arf", "African Resistance Fighters"],
    ["fsa", "Syrian Rebels"]
];
//@formatter:on

function dictionary(word) {
	word += "";
	//Make sure is a string
	for (var key in DICTIONARY_LARGE) {
		if (DICTIONARY_LARGE[key][0].toLowerCase() == word.toLowerCase())
			return DICTIONARY_LARGE[key][1];
	}

	return word;
}

function toTitleCase(str) {
	return str.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

/*
 * GetJSON(url, calback)
 * - Assumes its a url to a JSON file
 * - Calls a callback with the JSON as parameter
 * */
function getJSON(url, calback) {
	var xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function() {
		//console.log(xmlhttp.readyState);
		//console.log(xmlhttp.status);
		//console.log(">"+xmlhttp.responseText.length);
		if (xmlhttp.readyState == 4 && (xmlhttp.status == 200 || xmlhttp.status == 304)) {
			//console.log(">"+xmlhttp.responseText);
			var json = JSON.parse(xmlhttp.responseText);
			calback(json);
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

function AJAX(src, calback) {

	$.ajax({
		dataType : "html",
		url : src,
		success : function(data) {
			calback(data);
		}
	});
}

/* ======================================================================================
 * ==================     PRContainer onFaction Click      ==============================
 * ======================================================================================
 */
$(window).ready(function() {
	$('#PRContainer').on('click', '.team-header', function() {
		$(this).siblings('.team-header').removeClass('selected');
		$(this).addClass('selected');
		if ($(this).hasClass("teamA"))
			$("#Assets-container").find('.asset-pane').css("left", "-0%");
		else
			$("#Assets-container").find('.asset-pane').css("left", "-100%");
	});
});

/* ======================================================================================
 * ============================           LEFT MENU      =================================
 * ======================================================================================
 */
$(window).ready(function() {
	$('#Menu-button').click(function() {

		if ($('#Menu-button').hasClass('open')) {
			$("#Nav").removeClass("open-menu");
			$("#Menu-button").removeClass("open");

		} else {
			$("#Nav").addClass("open-menu");
			$("#Menu-button").addClass("open");

		}
	});
	$("#Nav-Overlay").click(function() {
		$("#Body-Wrapper").removeClass("open-menu");
		$("#Menu-button").removeClass("open");
	});
});

/* ======================================================================================
 * ============================           RIGHT MENU      =================================
 * ======================================================================================
 */
$(window).ready(function() {
	$("#Search>input").focus();

	$('#Assets-button').click(function() {
		if ($('#RightPane').hasClass('open')) {
			$("#RightPane").removeClass("open");
			$('#Assets-button').removeClass('open');

		} else {
			$("#RightPane").addClass("open");
			$('#Assets-button').addClass('open');
		}
	});

	$('#RPane-team1-button').click(function() {
		if ($('#RPane-team1-button').hasClass('active')) {
			$("#RPane-team1-button").removeClass("active");
			$(".asset-row.team2").removeClass("hide");

		} else {
			$("#RPane-team2-button").removeClass("active");
			$("#RPane-team1-button").addClass("active");
			$(".asset-row.team2").addClass("hide");
			$(".asset-row.team1").removeClass("hide");
		}
	});
	$('#RPane-team2-button').click(function() {
		if ($('#RPane-team2-button').hasClass('active')) {
			$("#RPane-team2-button").removeClass("active");
			$(".asset-row.team1").removeClass("hide");
		} else {
			$("#RPane-team1-button").removeClass("active");
			$("#RPane-team2-button").addClass("active");
			$(".asset-row.team1").addClass("hide");
			$(".asset-row.team2").removeClass("hide");
		}
	});
});
/* ======================================================================================
 * ============================           closeFABs      =================================
 * ======================================================================================
 */
function closeFABs() {
	$('#Fab-Shadow').addClass('hide');
	$('.fab').removeClass('open');
	$("body").removeClass('noScroll');
	$('#MapOverview').addClass('oHide');

}

/* ======================================================================================
 * ============================           toggleFAB      =================================
 * ======================================================================================
 */
function toggleFAB(view) {
	$('.fab').removeClass('open');
	var mView = $('#' + view);
	var mShadow = $('#Fab-Shadow');
	if (mView.hasClass('open')) {
		mShadow.addClass('hide');
		mView.removeClass('open');

	} else {
		$('#MapOverview').addClass('oHide');
		mShadow.removeClass('hide');
		mView.addClass('open');
		$("body").addClass('noScroll');

	}
}

/* ======================================================================================
 * ========================           TOGGLE Image Overview       =======================
 * ======================================================================================
 */

function toggleMapOverview() {
	var mView = $('#MapOverview');

	if (mView.hasClass('oHide')) {
		mView.removeClass('oHide');
		$('#Fab-Shadow').removeClass('hide');
		$("body").addClass('noScroll');
	} else {
		mView.addClass('oHide');
		$('#Fab-Shadow').addClass('hide');
		$("body").removeClass('noScroll');
	}

}

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "14px verdana").
 *
 * @see http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
function getTextWidth(text, font) {
	// if given, use cached canvas for better performance
	// else, create new canvas
	var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
	var context = canvas.getContext("2d");
	context.font = font;
	var metrics = context.measureText(text);
	return metrics.width;
};

