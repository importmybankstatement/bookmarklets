//http://stackoverflow.com/a/1706977
var scripts = document.getElementsByTagName('script'),
    this_url = scripts[scripts.length-1].src,
    this_baseurl = this_url.substring(0, this_url.lastIndexOf("/"));
    
var head = document.getElementsByTagName('head')[0],
    script = document.createElement('scr'+'ipt');
    
script.setAttribute("type","text/javascript");
script.setAttribute("src", this_baseurl+"/core.js");
head.appendChild(script);        

function scrape(scraper) {
    var $ = jQuery;
    scraper.statement_date = scraper.clean( $( "#statement_date" ).contents().text() );

    var table = $("#demo_bank_statement");
    var rows = $("tbody tr", table);    
    var rowCount = 0;
    
    rows.each(function(){
        rowCount++;
        // console.log("Parsing row: " + rowCount);
        
        var rowData = {};
        var value;
        var cellCount = 0;
        var cells = $("td", $(this));
        
        cells.each(function(){

            var cell_contents = scraper.clean($(this).contents().text());
            
            switch (cellCount){
                case 0: // Transaction date. Nice and easy...
                    rowData.date = cell_contents;
                break;
                
                case 1:
                    rowData.description = cell_contents;
                break;
                
                case 2:
                    // Check credit entry
                    if (cell_contents.length ) {
                        rowData.value = scraper.toNumber(cell_contents);
                        rowData.cr = true;
                    }
                break;
                
                case 3:
                    // Check if debit entry
                    if (cell_contents.length ) {
                        rowData.value = scraper.toNumber(cell_contents);                       
                        rowData.cr = false;
                    }
                    break;

                case 4:
                    // balance
                    if (cell_contents.length ) {
                        rowData.balance = scraper.toNumber(cell_contents);                       
                        scraper.closing_balance = rowData.balance;
                    }
                    
                break;
            }
            
            cellCount++;
        });
        
        // Add the row data to the entries array
        if( undefined !== rowData.value ) {
            scraper.add(rowData);
        }
    });
    
    scraper.show();
}
