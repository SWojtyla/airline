var loadedModels = {}
var sortedModels = []
var selectedModelId

$( document ).ready(function() {
	loadAirplaneModels()
})

function loadAirplaneModels() {
	$.ajax({
		type: 'GET',
		url: "airplane-models",
	    contentType: 'application/json; charset=utf-8',
	    dataType: 'json',
	    success: function(models) {
	    	$.each(models, function( key, model ) {
	    		loadedModels[model.id] = model
	  		});
	    	//updateModelInfo($('#modelInfo'))
	    },
        error: function(jqXHR, textStatus, errorThrown) {
	            console.log(JSON.stringify(jqXHR));
	            console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
	    }
	});
}


function addAirplane(modelId, quantity, fromPlanLink = false) {
	var airlineId = activeAirline.id
	var url = "airlines/" + airlineId + "/airplanes?model=" + modelId + "&quantity=" + quantity + "&airlineId=" + airlineId 
	$.ajax({
		type: 'PUT',
		data: JSON.stringify({}),
		url: url,
	    contentType: 'application/json; charset=utf-8',
	    dataType: 'json',
	    success: function(response) {
	    	refreshPanels(airlineId)
	    	if (fromPlanLink) {
	    		planLink($("#planLinkFromAirportId").val(), $("#planLinkToAirportId").val())
	    	} else {
	    		showAirplaneCanvas()
	    	}
	    },
        error: function(jqXHR, textStatus, errorThrown) {
	            console.log(JSON.stringify(jqXHR));
	            console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
	    }
	});
}

function sellAirplane(airplaneId) {
	$.ajax({
		type: 'DELETE',
		url: "airlines/" + activeAirline.id + "/airplanes/" + airplaneId,
	    contentType: 'application/json; charset=utf-8',
	    dataType: 'json',
	    success: function(response) {
	    	refreshPanels(activeAirline.id)
	    	showAirplaneCanvas()
	    },
        error: function(jqXHR, textStatus, errorThrown) {
	            console.log(JSON.stringify(jqXHR));
	            console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
	    }
	});
}


function updateModelInfo(modelId) {
	model = loadedModels[modelId]
	$('#airplaneModelDetails #selectedModel').val(modelId)
	$('#airplaneModelDetails #modelName').text(model.name)
	$('#airplaneModelDetails #capacity').text(model.capacity)
	$('#airplaneModelDetails #fuelBurn').text(model.fuelBurn)
	$('#airplaneModelDetails #range').text(model.range + "km")
	$('#airplaneModelDetails #speed').text(model.speed + "km/h")
	$('#airplaneModelDetails #price').text("$" + commaSeparateNumber(model.price))
}

function selectAirplaneModel(model) {
	$("#airplaneCanvas #airplaneModelList li.selected").removeClass("selected")
	//highlight the selected model
	$("#airplaneCanvas #airplaneModelList li[data-model-id='" + model.id +"']").addClass("selected")
	
	//expand the airplane list under this model
	showAirplaneInventory(model)
	//show basic airplane model details
	//model = loadedModels[modelId]
	$('#airplaneCanvas #selectedModel').val(model.id)
	$('#airplaneCanvas #modelName').text(model.name)
	$('#airplaneCanvas #capacity').text(model.capacity)
	$('#airplaneCanvas #fuelBurn').text(model.fuelBurn)
	$('#airplaneCanvas #range').text(model.range + " km")
	$('#airplaneCanvas #speed').text(model.speed + " km/h")
	$('#airplaneCanvas #price').text("$" + commaSeparateNumber(model.price))
	$('#airplaneCanvas #airplaneModelDetail').fadeIn(200)
	//hide owned model details
	$('#airplaneCanvas #ownedAirplaneDetail').fadeOut(200)
}

function showAirplaneInventory(modelInfo) {
	var airplaneInventoryList = $("#airplaneCanvas #airplaneInventoryList")
	airplaneInventoryList.empty()
	if (modelInfo.assignedAirplanes || modelInfo.freeAirplanes) {
		$.each(modelInfo.assignedAirplanes, function( key, airplaneId ) {
			$("<li class='row clickable' data-airplane-id='" + airplaneId +  "' onclick='loadOwnedAirplaneDetails(" + airplaneId + ")'>" + modelInfo.name + " (id " + airplaneId + ")</li>").appendTo(airplaneInventoryList)
		});
		
		$.each(modelInfo.freeAirplanes, function( key, airplaneId ) {
			$("<li class='row clickable' data-airplane-id='" + airplaneId +  "' onclick='loadOwnedAirplaneDetails(" + airplaneId + ")'>" + modelInfo.name + " (id " + airplaneId + ")</li>").appendTo(airplaneInventoryList)
		});
	}
}

function loadOwnedAirplaneDetails(airplaneId) {
	$("#airplaneInventoryList li.selected").removeClass("selected")
	//highlight the selected model
	$("#airplaneInventoryList li[data-airplane-id='" + airplaneId +"']").addClass("selected")
	
	var airlineId = activeAirline.id 
	$("#actionAirplaneId").val(airplaneId)
	//load link
	$.ajax({
		type: 'GET',
		url: "airlines/" + airlineId + "/airplanes/" + airplaneId + "?getAssignedLink=true",
	    contentType: 'application/json; charset=utf-8',
	    dataType: 'json',
	    success: function(airplane) {
	    	$("#airplaneDetailsId").text(airplane.id)
    		$("#airplaneDetailsCondition").text(airplane.condition.toFixed(2) + "%")
	    	$("#airplaneDetailsAge").text(airplane.age + "week(s)")
	    	$("#airplaneDetailsSellValue").text("$" + commaSeparateNumber(airplane.sellValue))
	    	$("#airplaneDetailsLink").empty()
	    	if (airplane.link) {
	    		$("#airplaneDetailsLink").append("<a href='javascript:void(0)' onclick='selectLinkFromMap(" + airplane.link.id + ", true)'>" + airplane.link.fromAirportName + "(" + airplane.link.fromAirportCity + ") => " + airplane.link.toAirportName + "(" + airplane.link.toAirportCity + ")</a>" )
	    		$("#sellAirplaneButton").hide()
	    	} else {
	    		$("#airplaneDetailsLink").text("-")
	    		$("#sellAirplaneButton").show()
	    	}
	    	$("#airplaneCanvas #ownedAirplaneDetail").fadeIn(200)
	    	
	    },
        error: function(jqXHR, textStatus, errorThrown) {
	            console.log(JSON.stringify(jqXHR));
	            console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
	    }
	});
}

function showAirplaneCanvas() {
	setActiveDiv($("#airplaneCanvas"))
	highlightTab($('#airplaneCanvasTab'))
	
	if ($("#airplaneCanvas #airplaneModelList li.selected").length !== 0) {
		selectedModelId = $("#airplaneCanvas #airplaneModelList li.selected").data("modelId")
	}
	
	var airlineId = activeAirline.id
	var ownedModelIds = []
	sortedModels = []
	$.ajax({
		type: 'GET',
		url: "airlines/"+ airlineId + "/airplanes?simpleResult=true",
	    contentType: 'application/json; charset=utf-8',
	    dataType: 'json',
	    success: function(ownedModels) { //a list of model with airplanes
	    	$.each(ownedModels, function(key, model) {
	    		ownedModelIds.push(model.id)
	    		sortedModels.push(model)
	  		});
	    	
	    	//now add all the models that the airline does not own
	    	$.each(loadedModels, function(modelId, model) {
	    		if (!ownedModelIds.includes(model.id)) {
	    			model.assignedAirplanes = []
	    			model.freeAirplanes = []
	    			sortedModels.push(model)
	    		}
	    	})
	    	
	    	updateAirplaneModelList($('#airplaneSortSelect').val(), $('#airplaneSortOrderSelect').val())
	    },
	    error: function(jqXHR, textStatus, errorThrown) {
	            console.log(JSON.stringify(jqXHR));
	            console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
	    }
	});
}

function updateAirplaneModelList(sortingProperty, ascending) {
	var airplaneModelList = $("#airplaneCanvas #airplaneModelList")
	airplaneModelList.empty()
	
	//sort the list
	sortedModels.sort(sortByProperty(sortingProperty, ascending == "ascending"))
	
	$.each(sortedModels, function(index, model) {
		var label = model.name + " (assigned: " + model.assignedAirplanes.length + " free: " + model.freeAirplanes.length + ")"
		var item = $("<li class='row clickable' data-model-id='" + model.id + "' onclick='selectAirplaneModel(this.modelInfo)'>" + label + "</li>").appendTo(airplaneModelList)
		item.get(0).modelInfo = model //tag the info to the element
		
		if (selectedModelId == model.id) {
			selectAirplaneModel(model)
		}
	});
}