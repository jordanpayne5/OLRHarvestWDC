
var minStartDate = "1/1/2020";

window.onload = function() {
    var today = new Date();
    var dd = String(today.getDate());
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    var starts = document.querySelectorAll(".start-date-input");
    starts.forEach( function(element) {
        element.value = minStartDate;
    });
    var ends = document.querySelectorAll(".end-date-input");
    ends.forEach( function(element) {
        element.value = today;
    });
};


$(document).ready(function(){
    $('.date-picker').datePicker();

    var accessToken = $.cookie("accessToken");
    var hasAuth = accessToken && accessToken.length > 0;
    
    updateUIWithAuthState(hasAuth);

    $("#harvest-auth-btn").on("click", function(){
        var accessToken = $('#accessToken').val();
        var accountID = $('#accountID').val();
        var hasToken = accessToken && accessToken.length > 0;
        var hasAccount = accountID && accountID.length > 0;

        if (hasToken && hasAccount) {
            console.log('has token and account');
            authenticateUser(accessToken, accountID);
        }
    });

    $("#submitButton").click(function () {
        var dateObj = [];
        if ($("#start-date-picker").is(":visible")){
            dateObj.push({key: 'startDate', value: document.getElementById("start-date-picker").value});
        }
        if ($("#end-date-picker").is(":visible")){
            dateObj.push({key: 'endDate', value: document.getElementById("end-date-picker").value});
        }

        tableau.connectionData = JSON.stringify(dateObj);
        tableau.connectionName = "Harvest Data Connector";
        tableau.submit();
    });

    $(".date-filter-btn").on("click", function(evt){
		var i, tablinks, toggle;

        tablinks = document.getElementsByClassName("date-filter-btn");
		for (i = 0; i < tablinks.length; i++) {
			tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        evt.currentTarget.className += " active";

        toggle = $(this).attr("data-toggle");

        if (toggle == "start-end-date") {
            $(document).find("#end-date-picker").parent().css("display", "inline-block");
            $(document).find("#start-date-picker").parent().css("display", "inline-block");
        } else if (toggle == "start-date") {
            $(document).find("#end-date-picker").parent().css("display", "none");
            $(document).find("#start-date-picker").parent().css("display", "inline-block");
        } else if (toggle == "end-date") {
            $(document).find("#start-date-picker").parent().css("display", "none");
            $(document).find("#end-date-picker").parent().css("display", "inline-block");
        }
	})
})


// This function toggles the label shown depending
// on whether or not the user has been authenticated
function updateUIWithAuthState(hasAuth) {
    if (hasAuth) {
        $(".auth-container").css('display', 'none');
        $(".filters-container").css('display', 'block');
    } else {
        $(".auth-container").css('display', 'block');
        $(".filters-container").css('display', 'none');
    }
}


function authenticateUser(accessToken, accountID) {
    $.ajaxSetup({
        beforeSend: function(request) {
            request.setRequestHeader("User-Agent", "MyApp (jordan.payne@online-rewards.com)");
            request.setRequestHeader("Authorization", "Bearer " + accessToken);
            request.setRequestHeader("Harvest-Account-ID", accountID);
        }
    });

    $.ajax({
        dataType: "json",
        url: "https://api.harvestapp.com/v2/users/me",
        complete: function(e, xhr, settings){
            if(e.status === 200){
                // set cookie
                $.cookie('accessToken', accessToken, { });
                window.location.href = 'http://localhost:8888/OLRHarvestData.html';
            }else{
                alert("Error when trying to authenticate user. Please check Account ID and Access Token and try again.");
            }
         }
    });
}



(function () {
    var myConnector = tableau.makeConnector();

    // Init function for connector, called during every phase but
    // only called when running inside the simulator or tableau
    myConnector.init = function(initCallback) {
        tableau.authType = tableau.authTypeEnum.custom;

        // If we are in the auth phase we only want to show the UI needed for auth
        if (tableau.phase == tableau.phaseEnum.authPhase) {
            $(".auth-container").css('display', 'block');
            $(".filters-container").css('display', 'none');
        }

        if (tableau.phase == tableau.phaseEnum.gatherDataPhase) {
            // If the API that WDC is using has an endpoint that checks
            // the validity of an access token, that could be used here.
            // Then the WDC can call tableau.abortForAuth if that access token
            // is invalid.
        }

        var accessToken = $.cookie("accessToken");
        var hasAuth = (accessToken && accessToken.length > 0) || tableau.password.length > 0;
        updateUIWithAuthState(hasAuth);

        initCallback();

        // If we are not in the data gathering phase, we want to store the token
        // This allows us to access the token in the data gathering phase
        if (tableau.phase == tableau.phaseEnum.interactivePhase || tableau.phase == tableau.phaseEnum.authPhase) {
            if (hasAuth) {
                tableau.password = accessToken;

                if (tableau.phase == tableau.phaseEnum.authPhase) {
                    // Auto-submit here if we are in the auth phase
                    tableau.submit()
                }

                return;
            }
        }
    };


    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            {
                id: "id",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "spent_date",
                alias: "Spent Date",
                dataType: tableau.dataTypeEnum.date
            }, {
                id: "hrs",
                alias: "Hours",
                dataType: tableau.dataTypeEnum.float
            }, {
                id: "rounded_hrs",
                alias: "Rounded Hours",
                dataType: tableau.dataTypeEnum.float
            }, {
                id: "notes",
                alias: "Notes",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "is_locked",
                alias: "Is Locked",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "locked_reason",
                alias: "Locked Reason",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "is_closed",
                alias: "Is Closed",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "is_billied",
                alias: "Is Billed",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "timer_started_at",
                alias: "Timer Started At",
                dataType: tableau.dataTypeEnum.datetime
            }, {
                id: "started_time",
                alias: "Started Time",
                dataType: tableau.dataTypeEnum.datetime
            }, {
                id: "ended_time",
                alias: "Ended Time",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "is_running",
                alias: "Is Running",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "billable",
                alias: "Billable",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "budgeted",
                alias: "Budgeted",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "billable_rate",
                alias: "Billable Rate",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "cost_rate",
                alias: "Cost Rate",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "created_at",
                alias: "created_at",
                dataType: tableau.dataTypeEnum.datetime
            }, {
                id: "user_name",
                alias: "User Name",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "user_id",
                alias: "User Id",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "client_id",
                alias: "Client Id",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "client_name",
                alias: "Client Name",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "client_currency",
                alias: "Client Currency",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "project_id",
                alias: "Project Id",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "project_name",
                alias: "Project Name",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "project_code",
                alias: "Project Code",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "task_id",
                alias: "Task Id",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "task_name",
                alias: "Task Name",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "user_assignment_id",
                alias: "User Assignment Id",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "task_assignment_id",
                alias: "Task Assignment Id",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "task_assignment_billable",
                alias: "Task Assignment Billable",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "task_assignment_is_active",
                alias: "Task Assignment Is Active",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "task_assignment_created_at",
                alias: "Task Assignment Created At",
                dataType: tableau.dataTypeEnum.datetime
            }, {
                id: "task_assignment_updated_at",
                alias: "Task Assignment Updated At",
                dataType: tableau.dataTypeEnum.datetime
            }, {
                id: "task_assignment_hourly_rate",
                alias: "Task Assignment Hourly Rate",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "task_assignment_budget",
                alias: "Task Assignment Budget",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "invoice",
                alias: "Invoice",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "external_reference",
                alias: "External Reference",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "item_number",
                alias: "Item Number",
                dataType: tableau.dataTypeEnum.string
            }, {
                id: "page",
                alias: "Page Number",
                dataType: tableau.dataTypeEnum.string
            },
        ];

        var tableSchema = {
            id: "harvestData",
            alias: "Harvest data for the user: Jordan Payne",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    myConnector.getData = function(table, doneCallback) {
        var dateObj = JSON.parse(tableau.connectionData);
        var dateFilterStr = "";
        for(var i = 0, len = dateObj.length; i < len; i++) {
            if( dateObj[i].key === "startDate" ) {
                var date = convertDateValue(dateObj[i].value);
                dateFilterStr += `&from=${date}`;
            } else if ( dateObj[ i ].key === "endDate" ) {
                var date = convertDateValue(dateObj[i].value);
                dateFilterStr += `&to=${date}`;
            }
        }
        
        var index = 1;
        var row = 1;
        callAPI(table, doneCallback, index, row, dateFilterStr);
        
    };

    
    tableau.registerConnector(myConnector);
    

})();

var tableData = [];

function callAPI(table, doneCallback, index, row, dateFilterStr) {
    $.ajax({
        beforeSend: function(request) {
            var accessToken = "1747113.pt.a99fulcFCkg-VxZH5Wejm2luzd7lFGr2zL2y1pHsYaV8Qqw3xjrOXAmOEXEjwxuFfbCXnSdv8zKKvOSMZ9by7w"
            var accountID = "251865";
            request.setRequestHeader("User-Agent", "MyApp (jordan.payne@online-rewards.com)");
            request.setRequestHeader("Authorization", "Bearer " + accessToken);
            request.setRequestHeader("Harvest-Account-ID", accountID);
        },
        dataType: "json",
        url: "https://api.harvestapp.com/v2/time_entries?page=" + index.toString() + dateFilterStr,
    }).done(function(data){
        var row_num = row;
        var pages = data.total_pages,
        feat = data.time_entries;
        
        if (index <= pages) {
            console.log(JSON.stringify(feat));
            console.log("Data added: " + index + " of " + pages);
            
            // Iterate over the JSON object
            for (var i = 0, len = feat.length; i < len; i++) {
                tableData.push({
                    "id": feat[i].id,
                    "spent_date": feat[i].spent_date,
                    "hrs": feat[i].hours,
                    "rounded_hrs": feat[i].rounded_hours,
                    "notes": feat[i].notes,
                    "is_locked": feat[i].is_locked,
                    "locked_reason": feat[i].locked_reason,
                    "is_closed": feat[i].is_closed,
                    "is_billed": feat[i].is_billed,
                    "timer_started_at": feat[i].timer_started_at,
                    "started_time": feat[i].started_time,
                    "ended_time": feat[i].ended_time,
                    "is_running": feat[i].is_running,
                    "billable": feat[i].billable,
                    "budgeted": feat[i].budgeted,
                    "billable_rate": feat[i].billable_rate,
                    "cost_rate": feat[i].cost_rate,
                    "created_at": formatDateValue(feat[i].created_at),
                    "updated_at": feat[i].updated_at,
                    "user_id": feat[i].user.id,
                    "user_name": feat[i].user.name,
                    "client_id": feat[i].client.id,
                    "client_name": feat[i].client.name,
                    "client_currency": feat[i].client.currency,
                    "project_id": feat[i].project.id,
                    "project_name": feat[i].project.name,
                    "project_code": feat[i].project.code,
                    "task_id": feat[i].task.id,
                    "user_": feat[i].task.name,
                    "user_assignment_id": feat[i].user_assignment.id,
                    "task_assignment_billable": feat[i].task_assignment.billable,
                    "task_assignment_is_active": feat[i].task_assignment.is_active,
                    "task_assignment_created_at": feat[i].task_assignment.created_at,
                    "task_assignment_updated_at": feat[i].task_assignment.updated_at,
                    "task_assignment_hourly_rate": feat[i].task_assignment.hourly_rate,
                    "task_assignment_budget": feat[i].task_assignment.budget,
                    "invoice": feat[i].invoice,
                    "external_reference": feat[i].external_reference,
                    "item_number": i,
                    "page": index
                });

                //tableau.reportProgress("Getting row: " + row_num);
                row_num = row_num + 1;
            }
            // add the data 
            
            index = index + 1
            callAPI(table, doneCallback, index, row_num, dateFilterStr);
        } else {
            chunkData(table, tableData);
            doneCallback();
        }
    });

    // add the data in manageable chunks
    function chunkData(table, tableData){
        var row_index = 0;
        var size = 100;
        while (row_index < tableData.length){
             table.appendRows(tableData.slice(row_index, size + row_index));
             row_index += size;
             tableau.reportProgress("Getting row: " + row_index);
         }
     }
  }

function convertDateValue(date) {
    var newDate = new Date(date);
    var dd = String(newDate.getDate()).padStart(2, '0');
    var mm = String(newDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = newDate.getFullYear();
    var today = yyyy + mm + dd;
    return today;

}

function formatDateValue(date) {
    var newDate = date.replace("T", " ");
    var month = newDate.split("-")[1];
    var day = newDate.split("-")[2].split(" ")[0];
    var year = newDate.split("-")[0];
    var time = newDate.split("-")[2].split(" ")[1];
    var newDateStr = `${month}/${day}/${year} ${time}`;
    return newDateStr;
}

(function( $ ) {
		
    $.fn.datePicker = function( options ) {
        var parent = $( this );
        // This is the easiest way to have default options.
        var settings = $.extend({
                    // These are the defaults.
                    display: "table-cell",
                    marginRight: "5px",
                    backgroundColor: "#ced4da",
                    padding: "3px 8px 3px 8px",
                    marginBottom: "5px",
                    borderRadius: "5px",
                    cursor: "pointer"
            }, options );

        var editRecipientSettings = $.extend({
                // These are the defaults.
                display: "table-cell",
                marginRight: "5px",
                backgroundColor: "#ced4da",
                padding: "3px 8px 3px 8px",
                marginBottom: "5px",
                borderRadius: "5px",
                cursor: "pointer"
        }, options );

        var Hilight = function( element ) {
            this.$element = element;  
        };

        const total_cal_days = 6 * 7;

        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];

        const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];
        
        return this.each(function() {
            var $element = $(this);
            var $current_date = "";

            var dropdown = '<div class="month"><div class="prev"><i class="fa fa-chevron-left" aria-hidden="true"></i></div><div class="next"><i class="fa fa-chevron-right" aria-hidden="true"></i></div><div><span class="month-name"></span><br><span class="month-year" style="font-size:18px"></span></div></div><ul class="weekdays"><li>Su</li><li>Mo</li><li>Tu</li><li>We</li><li>Th</li><li>Fr</li><li>Sa</li></ul><ul class="days"></ul>';

            $element.parent().find(".date-picker-dropdown").append(dropdown);

            $element.recipient_container = function() {
                $element.on("click", function(){
                    var curr_date = new Date($element.val());
                    $current_date = $element.val();
                    $element.parent().find(".month .month-name").text(monthNames[curr_date.getMonth()]);
                    $element.parent().find(".month .month-year").text(curr_date.getFullYear());

                    var days_list = populateDays(curr_date, $current_date);
                    $element.parent().find(".date-picker-dropdown .days").html(days_list);

                    var dp = $element.parent().find(".date-picker-dropdown");
                    dp.toggleClass("active");
                    $(".date-picker-dropdown").not(dp).each(function(){
                        $(this).removeClass("active");
                    });
                    $element.day_clicked();
                });

                $element.month_change();
                

                $(document).click(function (e) {
                    if (!$(e.target).closest(".date-picker, .date-picker-dropdown").length) {
                        $(".date-picker-dropdown").removeClass("active");
                    }
                });    

            }
            

            $element.month_change = function() {
                $element.parent().find(".month .prev").on("click", function () {
                    var month = $element.parent().find(".month .month-name");
                    var year = $element.parent().find(".month .month-year");
                    var newDate = new Date(month.text() + year.text());
                    newDate.setMonth(newDate.getMonth() - 1);
                    selected_month = newDate.getMonth() + 1;
                    selected_year = newDate.getFullYear();
                    month.text(monthNames[newDate.getMonth()]);
                    year.text(newDate.getFullYear());
                    var days_list = populateDays(newDate, $current_date);
                    $element.parent().find(".date-picker-dropdown .days").html(days_list);
                    $element.day_clicked();
                });

                $element.parent().find(".month .next").on("click", function () {
                    var month = $element.parent().find(".month .month-name");
                    var year = $element.parent().find(".month .month-year");
                    var newDate = new Date(month.text() + year.text());
                    newDate.setMonth(newDate.getMonth() + 1);
                    selected_month = newDate.getMonth() + 1;
                    selected_year = newDate.getFullYear();
                    month.text(monthNames[newDate.getMonth()]);
                    year.text(newDate.getFullYear());
                    var days_list = populateDays(newDate, $current_date);
                    $element.parent().find(".date-picker-dropdown .days").html(days_list);
                    $element.day_clicked();
                });
    
            }

            $element.day_clicked = function() {
                $element.parent().find(".date-picker-dropdown .month-day").on("click", function() {
                    var day = $(this).text();
                    var month_name = $element.parent().find(".month .month-name").text();

                    var month_year = $element.parent().find(".month .month-year").text();
                    var month_number = ($.inArray( month_name, monthNames )) + 1;
                    
                    if ( $(this).hasClass("prev-month-day") ) {
                        var newDate = new Date(`${month_number}/${1}/${month_year}`);
                        var prev_date = PrevNextMonth(newDate, -1);
                        var selected_date = `${prev_date.getMonth() + 1}/${day}/${prev_date.getFullYear()}`;
                    } else if ( $(this).hasClass("next-month-day") ) {
                        var newDate = new Date(`${month_number}/${1}/${month_year}`);
                        var prev_date = PrevNextMonth(newDate, 1);
                        var selected_date = `${prev_date.getMonth() + 1}/${day}/${prev_date.getFullYear()}`;
                    } else {
                        var selected_date = `${month_number}/${day}/${month_year}`;
                    }

                    $(this).siblings().filter(function( index ) {
                        return $(this).hasClass("active");
                    }).removeClass("active");

                    $(this).addClass("active");
                    $element.val(selected_date);
                    $current_date = selected_date;
                })
            }

            function PrevNextMonth(date, direction) {
                var newDate = new Date(date);

                if (newDate.getMonth() == "0" && direction == -1){
                    newDate.setMonth(newDate.getMonth() + 11, 1);
                    newDate.setYear(newDate.getFullYear()-1);
                } else {
                    newDate.setMonth(newDate.getMonth() + direction, 1);
                }
                return newDate;
              }

            function populateDays(date, c_date) {
                var days_added = 0;
				var days_list = [];
				var days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
				var startDayName = dayNames[new Date(date.getFullYear(), date.getMonth(), 1).getDay()];
				var startDayIndex = dayNames.indexOf(startDayName);

                var newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                newDate.setMonth(newDate.getMonth() + 1);

				for (let i = 0; i < startDayIndex; i++) {
                    days_added++;
					var prev_days = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
					var day = prev_days - (startDayIndex - i);
					days_list.push('<li class="month-day prev-month-day">' + day + '</li>');
				}

                
				for (let i = 1; i <= days; i++) {
                    
                    var date_loop = `${newDate.getMonth()}/${i}/${newDate.getFullYear()}`;

                    days_added++;
                    if ( date_loop == `${c_date}` ) {
                        days_list.push(
                            '<li class="month-day current-month active">' + i + '</li>'
                        );
                    } else {
                        days_list.push(
                            '<li class="month-day current-month">' + i + '</li>'
                        );
                    }
					
                }

                for (let i = 1; days_added < total_cal_days; i++) {
                    days_added++;
					days_list.push('<li class="month-day next-month-day">' + i + '</li>');
				}
                
				return days_list.join("");
			}

            if( !$element.data( "init" ) ) {
                var instance = new Hilight( $element );
                $element.data( "init", instance );

                $element.recipient_container();
            }

        });
    };

}( jQuery ));




