var head = document.getElementsByTagName('head')[0];
var script = document.createElement('scr'+'ipt');
script.setAttribute("type","text/javascript");
script.setAttribute("src", "https://rawgit.com/HarryButtle/BankStatementExporter/master/core.js");
head.appendChild(script);        

function scrape(scraper) {
    var $ = jQuery;
    var months = {"Jan":"01", "Feb":"02", "Mar":"03", "Apr": "04", "May": "05", "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"};
    var statementYear = "????";

    //
    // Get the year for the statement
    //
    var statementDate = String($("div .hsbcTextRight").attr("innerHTML"));

    statementBits = statementDate.split(" ");
    statementMonth = statementBits[1]
    statementYear = statementBits[2];

    scraper.statement_date = statementDate;
    
    var table = $("table")[1];
    var rows = $("tbody tr", table);
    var lastMonth = "";
    var isFirstMonthParsed = true;
    var rowCount = 0;
    var reBalanceForward = /Balance\s+carried\s+forward/i; 
    
    rows.each(function(){
        rowCount++;
        
        var rowData = {};        
        var cellCount = 0;
        var cells = $("td", $(this));
        
        cells.each(function(){
            var cell_contents = scraper.clean($(this).contents().text());
            //console.log(cell_contents);
            
            switch (cellCount){
                case 0:
                
                
                    // The date: in WE'RE ENTIRELY FUCKING STUPID FORMAT. Convert to only-somewhat-braindead American format. 
                    // ========= WTF people, we have the ISO standard for a reason. *breathe, breathe*
                    var dateBits = cell_contents.split(" ");
                    var dateOfMonth = dateBits[0];
                    var monthAsText = dateBits[1];

                    // If this statement is for Jan but contains elements from Dec last year, 
                    // decrement the year so that the dates are correct. I love you HSBC, I fuckin' love you like a kitten.
                    if (isFirstMonthParsed) {
                        isFirstMonthParsed = false;
                        if (statementMonth == "Jan" && monthAsText == "Dec") {
                            statementYear = parseInt(statementYear)-1+"";
                        }
                    }
                    
                    // console.log("Last month: " + lastMonth);
                    // console.log("This month: " + monthAsText)
                    
                    if (lastMonth == "Dec" && monthAsText == "Jan") {
                        // console.log("Noticed year change, updating the dates...");
                        statementYear = parseInt(statementYear)+1+"";
                    }
                    
                    var finalDateString = dateOfMonth + "/" + months[monthAsText] + "/" + statementYear;
                    
                    // console.log("Date: " + finalDateString);
                    
                    rowData.date = finalDateString;            
                    lastMonth = monthAsText;
                    
                break;	
                
                case 2:
                    // If this is a balance forwarding row, ignore it.                    
                    if ( reBalanceForward.exec(cell_contents) != null ) {
                        // console.log("No description, ignoring this row...");
                        rowData.ignore = true;
                        break;
                    }
                    rowData.description = cell_contents;                    
                    
                break;
                
                case 3:
                    // Check debit entry
                    if (cell_contents.length ) {
                        rowData.value = scraper.toNumber(cell_contents);
                        rowData.cr = false;
                    }
                break;
                
                case 4:
                    // Check credit entry
                    if (cell_contents.length ) {
                        rowData.value = scraper.toNumber(cell_contents);
                        rowData.cr = true;
                    }					
                break;
                
                case 5:
                    //Balance
                    if (cell_contents.length ) {
                        rowData.balance = scraper.toNumber(cell_contents);
                        scraper.closing_balance = rowData.balance;                        
                    }					
                break;                
                
                case 6:
                    //Overdrawn
                    if (cell_contents.length ) {
                        rowData.balance = 0 - rowData.balance;
                        scraper.closing_balance = rowData.balance;                        
                    }					
                break;                                
            }
            
            cellCount++;
        });
        
        // Add the row data to the entries array
        scraper.add(rowData);
        
    });

    scraper.show();
}