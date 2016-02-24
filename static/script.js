"use strict"


var socket = io.connect('http://localhost:3000');
var $host_table = $('#host-table');

function timeSince(timeStamp) {
	
    var now = new Date(),
      secondsPast = (now.getTime() - timeStamp) / 1000;
    if(secondsPast < 60){
      return parseInt(secondsPast) + 's';
    }
    if(secondsPast < 3600){
      return parseInt(secondsPast/60) + 'm';
    }
    if(secondsPast <= 86400){
      return parseInt(secondsPast/3600) + 'h';
    }
    if(secondsPast > 86400){
    	timestamp = new Date().setTime(timestamp);
        day = timeStamp.getDate();
        month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ","");
        year = timeStamp.getFullYear() == now.getFullYear() ? "" :  " "+timeStamp.getFullYear();
        return day + " " + month + year;
    }
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
    $('td:eq(2)', $row).text( timeSince(data.incident_start) );

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

    	$timecell.text( (item.incident_start) ? timeSince(item.incident_start) : '---');

    	$hostcell.appendTo($row);
    	$statuscell.appendTo($row);
    	$timecell.appendTo($row);
    	$row.appendTo($host_table);

    	if(item.status){
	    	$row.removeClass('error');
	    }else{
	    	$row.addClass('error');
	    }
    })
});
