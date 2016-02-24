"use strict"


var socket = io.connect('http://localhost:3000');
var $host_table = $('#host-table');


var pad = function(int){
    if(int < 9){
        int = "0"+int;
    }
    return int;
}

var nicetime = function( timestamp ){
    var date = new Date(timestamp);
    var now = new Date();

    var year = date.getFullYear();
    var month = pad( date.getMonth()+1 );
    var day = pad( date.getDate() );
    var hours = pad( date.getHours() );
    var minutes = pad( date.getMinutes() );
    var seconds = pad( date.getSeconds() );

    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

socket.on('statusChanged', function (data) {
    console.log(data);
    //socket.emit('my other event', { my: 'data' });
    var $row = $('#row' + data.id);

    var $status = (data.status) ? $('<span class="glyphicon glyphicon-ok-circle" aria-hidden="true" />') : $('<span class="glyphicon glyphicon-remove-circle" aria-hidden="true" />');
    if(data.status){
    	$row.removeClass('error');
    }else{
    	$row.addClass('error');
    }


    $('td:eq(1)', $row).empty();
    $('td:eq(1)', $row).append( $status );
    $('td:eq(2)', $row).text( nicetime(data.incident_start) );

});

socket.on('statusChecked', function(data){
	$('#last_checked').text( nicetime(data.lastupdated) );
});

socket.on('data', function (data) {

    var $row, $hostcell, $statuscell, $timecell;
    $.each(data.hosts, function(index,item){
    	$row = $('<tr />');
    	$row.attr('id', 'row' + item.id);

    	$hostcell = $('<td />');
    	$statuscell = $('<td />');
    	$timecell = $('<td />');

    	$hostcell.text( item.host );
    	

    	var $status = (item.status) ? $('<span class="glyphicon glyphicon-ok-circle" aria-hidden="true" />') : $('<span class="glyphicon glyphicon-remove-circle" aria-hidden="true" />');

 		$status.appendTo($statuscell);

    	$timecell.text( (item.incident_start) ? nicetime(item.incident_start) : '---');

    	$hostcell.appendTo($row);
    	$statuscell.appendTo($row);
    	$timecell.appendTo($row);
    	$row.appendTo($host_table);

    	if(item.status){
	    	$row.removeClass('error');
	    }else{
	    	$row.addClass('error');
	    }


    });
    $('#last_checked').text( nicetime(data.lastupdated) );
});
