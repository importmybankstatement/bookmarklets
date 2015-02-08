window.console = window.console || {};
window.console.log = window.console.log || function(){};

var scripts = document.getElementsByTagName('script'),
    this_url = scripts[scripts.length-1].src,
    this_baseurl = this_url.substring(0, this_url.lastIndexOf("/"));
    
function wait(component, elapsedTime) {

    if( elapsedTime ) {
        if( component.isLoaded.call() ) {
            console.log("IsLoaded: ", component);
            return component.onLoaded && component.onLoaded.call();
        }
        
        if( elapsedTime >= component.timeout ) {
            console.log( "Timeout: ", component);
            return component.onTimeout && component.onTimeout.call();
        }
        
        //wait for longer
        setTimeout( function(){
                    console.log("setTimeout: ", component);
                    wait(component, 200 + elapsedTime);
                }, 200);  
        return;
    }
    
    if( component.condition.call() ) {
        console.log("Loading: ", component);
        component.load.call();
        wait(component, 1 );
    }
    else {
        console.log("Already Loaded", component);
        return component.onLoaded && component.onLoaded.call();
    }
}
(new wait({
    name  : "jQuery 1.8.0",
    timeout  : 3000, //in milliseconds
    condition: function() {
    
        var head = document.head || document.getElementsByTagName('head')[0],
            body = document.body || document.getElementsByTagName('body')[0],
            s     = document.createElement('div');

        s.innerHTML='\
<div id="importmybankstatement_progress" style="z-index:999999; left: 20%; width: 60%; border: 10px solid #3d8b3d; position: fixed; top:40%; height:200px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; -ms-box-sizing: border-box; box-sizing: border-box;">\
    <span style="position: absolute; width:100%; text-align:center; line-height:200px; font-size: 3.0em; color: #3d8b3d;">Please wait ...</span>\
    <div id="importmybankstatement_progressbar" style="width: 20%; top: 0px; left:0px; right:0px; height:100%; background-color: #5cb85c;"></div>\
</div>';
        body.appendChild(s);            
        
        //evaluate install condition
        return (typeof jQuery === "undefined" && !document.querySelector('script[src*="1.8.0/jquery."]'));
        },
        
    load     : function() {
    
        var head = document.head || document.getElementsByTagName('head')[0],
            script = document.createElement('scr'+'ipt');
        script.setAttribute("type","text/javascript");
        
        //we extend our trust to Google here, 
        //this is the only file included outside of the https://cdn.rawgit.com/importmybankstatement/ domain
        script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js");
        head.appendChild(script);        
    },
    
    isLoaded : function() {           
        return (typeof jQuery != "undefined");
    },
    
    onLoaded: function() {        
        var $ = jQuery;
        
        //increment progress bar
        $('#importmybankstatement_progressbar').css('width', '40%');
        
        //http://stackoverflow.com/questions/187537/is-there-a-case-insensitive-jquery-contains-selector
        if( jQuery.expr.createPseudo ) {
            jQuery.expr[":"].icontains = jQuery.expr.createPseudo(function (arg) {                                                                                                                                                                
                return function (elem) {                                                            
                    return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;        
                };                                                                                  
            });    
        }
        else {
            //http://stackoverflow.com/questions/12404653/jquery-case-insensitive-contains-selector-1-8-1
            jQuery.expr[":"].icontains = function(obj,index,meta) {
                return jQuery(obj).text().toUpperCase().indexOf(meta[3].toUpperCase()) >= 0;
            }
        }
        //styles
        var styles = " \
<style type=\"text/css\"> \
textarea {background-color:orange; } .fancybox-inner > p {overflow-y:scroll;height:250px;} \
.flash{ \
  -moz-animation: flash 1s ease-out; \
  -moz-animation-iteration-count: 3; \
  -webkit-animation: flash 1s ease-out; \
  -webkit-animation-iteration-count: 3; \
  -ms-animation: flash 1s ease-out; \
  -ms-animation-iteration-count: 3; \
} \
@-webkit-keyframes flash { \
    0% { background-color:none;} \
    50% { background-color:#fbf8b2;} \
    100% {background-color:none;} \
} \
@-moz-keyframes flash { \
    0% { background-color:none;} \
    50% { background-color:#fbf8b2;} \
    100% {background-color:none;} \
} \
@-ms-keyframes flash { \
    0% { background-color:none;} \
    50% { background-color:#fbf8b2;} \
    100% {background-color:none;} \
} \
</style> \
";
  
        $('head').append(styles);
        var assets_to_load = 0;
        
        //http://viget.com/inspire/js-201-run-a-function-when-a-stylesheet-finishes-loading
        if( !document.querySelector('link[rel="stylesheet"][href*="jquery.fancybox.css"]') ){
            assets_to_load++;                
            var link = $('<link />', {
                rel : "stylesheet",
                type: "text/css",
                href: this_baseurl+"/vendor/fancyBox/source/jquery.fancybox.css"+"?cb="+Date.now()
            });
            link.appendTo('head');
            
            var img = $('<img />', {
                src: link.attr('href')
            })
            .error( function() {
                // Code to execute when the stylesheet is loaded
                console.log("IsLoaded: Fancybox css "+$(this).attr('src'));
                assets_to_load--;
                $('#importmybankstatement_progressbar').css('width', ((4 - assets_to_load)*20) + '%' );                
                
                //remove the img element
                $(this).remove();
            });
            
            console.log("Loading: Fancybox css");
            img.appendTo('body');
        }

        if( !('fancybox' in window['jQuery']) 
            && !document.querySelector('script[src*="/jquery.fancybox.pack.js"]') 
            && !document.querySelector('script[src*="/jquery.fancybox.js"]')) {
            
            assets_to_load++;
            console.log("Loading: Fancybox js");
            $.getScript("https://cdn.rawgit.com/importmybankstatement/fancyBox/v2.1.5.imbs/source/jquery.fancybox.js", function(){
                assets_to_load--;              
                $('#importmybankstatement_progressbar').css('width', ((4 - assets_to_load)*20) + '%' );
                console.log("IsLoaded: Fancybox js");
            });                         
        }

        wait({
            name  : "asset monitor",
            condition: function() {    
                return true;
            },
            load : function(){
            },
            isLoaded : function() {        
                //all assets loaded
                return !assets_to_load;
            },    
            onLoaded: function() {                
                //update progress bar and launch scraper
                $('#importmybankstatement_progressbar').css('width', '100%' );                
                scrape(new Scraper());
            }        
        });  
    },
    onTimeout: function() {
        alert("There was a timeout loading the neessecary scripts. Refresh the page and click the bookmarklet again");
    }
})
);

var Scraper = function() {
    //format enums
    this.acemoney = 0;
    this.freeagent = 1;
    this.quicken = 2;
    this.YNAB = 3;
    this.homebank = 4;
    
    this.entries = [];
    this.statement_date = undefined;
    
    //condense whitespace, strip non printing characters
    this.clean = function(str) {
        var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]+/g;    
        return str.trim().replace(re, "").replace(/[ ]{2,}/g, " ");
    }

    this.toNumber = function(str) {
        return Number(str.replace(/[^0-9\.,]+/g, "")).toFixed(2);
    }
    
    this.add = function(rowData) {
    
        // Check if the row has a value, ignore it if not.
        if (typeof rowData.value === 'undefined') {
            rowData.ignore = true;
        }
        else {
            rowData.dr = !rowData.cr;            
        }
                    
        // Add the row data to the entries array
        this.entries.push(rowData);
    }
            
    this.formatTo = function(format_enum, crlf) {

        csv = "";

        //csv headers
        if( format_enum == this.YNAB ) {
            csv =  "Date,Payee,Category,Memo,Outflow,Inflow" + crlf;
        }
        
        // Serialize the entries array
        for (i = 0; i < this.entries.length; i++) {
            var currentRow = this.entries[i];
            if (!currentRow.ignore) {
            
                var data = [];
                
                switch (format_enum) {
                    case this.acemoney:                            
                        //http://support.mechcad.net/knowledgebase.php?article=18
                        data.push("");                                        //* A (1) - Transaction/check number
                        data.push(currentRow.date);                           //* B (2) - Date
                        data.push("\"" + currentRow.description + "\"");      //* C (3) - Payee
                        data.push("");                                        //* D (4) - Category
                        data.push("");                                        //* E (5) - Status
                        data.push((currentRow.dr) ? currentRow.value : "");   //* F (6) - Withdrawal
                        data.push((currentRow.cr) ? currentRow.value : "");   //* G (7) - Deposit
                        data.push((undefined != currentRow.balance) 
                                  ? currentRow.balance 
                                  : "");                                      //* H (8) - Total
                        data.push("");                                        //* I (9) - Comment
                        csv += data.join(",") + crlf;
                        break;
                        
                    case this.freeagent :                
                        //http://www.freeagent.com/support/kb/banking/file-format-for-bank-upload-csv
                        data.push(currentRow.date);
                        data.push( (currentRow.cr) ? currentRow.value : Number(0 - currentRow.value).toFixed(2) );
                        data.push("\"" + currentRow.description + "\"");
                        csv += data.join(",") + crlf;                        
                        break;
                        
                    case this.quicken :
                        //http://en.wikipedia.org/wiki/Quicken_Interchange_Format
                        data.push("^");
                        data.push("D"+ currentRow.date);
                        data.push("T"+ ((currentRow.cr) ? currentRow.value : Number(0 - currentRow.value).toFixed(2)) );
                        data.push("P"+ currentRow.description);
                        csv += data.join(crlf) + crlf;                                                
                        break;
                        
                    case this.YNAB :
                        //http://www.youneedabudget.com/support/article/csv-file-importing
                        data.push(currentRow.date);                         //date
                        data.push(currentRow.description);                  //payee
                        data.push('');                                      //category
                        data.push('');                                      //memo
                        data.push( (currentRow.dr) ? currentRow.value : ''); //outflow
                        data.push( (currentRow.cr) ? currentRow.value : ''); //inflow
                        csv += data.join(",") + crlf;
                        break;
                        
                    case this.homebank :
                        data.push(currentRow.date);         //date	format should be DD-MM-YY
                        data.push(0);                       //paymode	from 0=none to 10=FI fee
                        data.push('');                      //info	a string
                        data.push(currentRow.description);  //payee	a payee name
                        data.push('');                      //memo	a string
                        data.push( (currentRow.cr) ? currentRow.value : Number(0 - currentRow.value).toFixed(2) ); //amount	a number with a '.' or ',' as decimal separator, ex: -24.12 or 36,75
                        data.push('');                      //category	a full category name (category, or category:subcategory)
                        data.push('');                      //tags separated by space
                        csv += data.join(";") + crlf;
                        break;
/*                        
QFX - Quicken Financial Exchange
OFX - Open Financial Exchange?                        
 */                          
                }                
            }
        }
        
        return csv;        
    }
    
    //http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript    
    this.guid = (function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
      }
      return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
               s4() + '-' + s4() + s4() + s4();
      };
    })();
    
    this.removeProgressBar = function() {
        window.jQuery('#importmybankstatement_progress').remove();
    }

    this.show = function() {
        var $ = jQuery;
        console.log("Showing lightbox");
        
        var scraper = this;
        var pID = this.guid(), 
            downloadID = this.guid(), 
            selectID = this.guid(), 
            mailRef = this.guid(),
            textarea = this.guid();        

        var tooltip ="\
1. Open your PDF file\n\
2. Press CTRL+A to select all the text.\n\
3. Press CTRL+C to copy all the text to the clipboard\n\
4. Click on this control\n\
5. Press CTRL+V to paste in the text\n\
The control should flash briefly, if it turns red then\n\
it has failed to extract any transactions.\n\
If it is green then any extracted transactions will show in the box below.\
";
        //don't show the paste area if no parsePDF function exists
        display_csv  = (typeof parsePDF == 'function') 
                       ? '<div><textarea id="'+textarea+'" rows=1 cols=2 title="'+tooltip+'"></textarea><div>'
                       : "";
        display_csv += '<div><span><strong>Statement Date:</strong>'+(this.statement_date || ' ')+'</span>'
                        + ( this.statement_number 
                            ? '&nbsp;<span><strong>No#:</strong>'+this.statement_number+'</span>'
                            : ' ' 
                            )
                        + ( this.closing_balance
                            ? '&nbsp;<span><strong>Closing Balance:</strong>'+this.closing_balance+'</span>'
                            : ' '
                            )
                        + '</div>';                        
        display_csv += '<p id="'+pID+'" class=\"csv\"></p>';
        display_csv += '<div>';
        display_csv += '<button id="'+downloadID+'">Download</button>';
        display_csv += '&nbsp;&nbsp;&nbsp;';
        display_csv += '<select id="'+selectID+'"><option value="0">AceMoney CSV</option><option value="1">FreeAgent CSV</option><option value="4">HomeBank</option><option value="3">YNAB</option><option value="2">Quicken .QIF</option></select>';
        display_csv += '&nbsp;&nbsp;&nbsp;';
        display_csv += '<span id="'+mailRef+'"></span>';
        display_csv += '</div>';
        
        // show csv content in fancybox
        $.fancybox({
            'content' : display_csv,
            height: 300,
            beforeShow : function() {      
                //remove progress bar
                scraper.removeProgressBar();
            },
            beforeClose: function() {
                //terminate any timers
                if( $.pasteWatcher && $.pasteWatcher.timer ){
                    clearInterval( $.pasteWatcher.timer );
                }
            },
            afterShow: function() {
                            
                $('#'+downloadID).click(function() {
                
                    var pom = document.createElement('a');
                    var format = parseInt($('#'+selectID).val());
                    var extension = (format == scraper.quicken) ? ".qif" : ".csv";
                    var filename = "statement";
                    
                    if( scraper.statement_number ) {
                        filename += "_" + scraper.statement_number;
                    }
                    
                    if( scraper.statement_date ) {
                        var date = new Date(scraper.statement_date);
                        
                        filename += "_" + (
                                    isNaN( date.getTime() ) 
                                    ? scraper.statement_date 
                                    :   //http://stackoverflow.com/questions/3605214/javascript-add-leading-zeroes-to-date
                                        date.getFullYear() + "-" + ('0' + (date.getMonth()+1)).slice(-2) + "-" + ('0' + date.getDate()).slice(-2)
                                    );
                    }
                    
                    if( scraper.closing_balance ) {
                        filename += "_" + scraper.closing_balance.replace('.','p');
                    }
                    
                    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( scraper.formatTo( format,"\n" ) ));
                    pom.setAttribute('download', filename + extension);
                    pom.click();
                
                });                        
                
                $('#'+selectID).change(function() {
                
                    var format = parseInt($('#'+selectID).val());        
                    $('#'+pID).html( scraper.formatTo( format, "<br />" ) );
                   
                   var subject = (scraper.statement_date
                                 ? scraper.statement_date
                                 : "statement");

                    //http://stackoverflow.com/questions/10219781/javascript-adding-linebreak-in-mailto-body
                    var body = encodeURIComponent( scraper.formatTo(format,"\r\n") );
                    $('#' + mailRef).empty().append('<a href="mailto:?subject='+subject+'&body='+body+'" target="_blank">email file</a>');
                    
                    // deselect any selected text
                    if (document.selection) document.selection.empty();
                    else if (window.getSelection) window.getSelection().removeAllRanges();                
                    
                    // select text for added convenience
                    var element = $('#'+pID).get(0);
                    var range;
                    if (document.selection) {
                        range = document.body.createTextRange();
                        range.moveToElementText(element);
                        range.select();
                    } else if (window.getSelection) {
                        range = document.createRange();
                        range.selectNode(element);
                        window.getSelection().addRange(range);
                    }                    
                });

                //fixes intial selection not showing problem.
                setTimeout( function(){                
                    $('#'+selectID).change();
                },100);
                
                //Paste-able textarea
                var $pasteTextarea = $('#'+textarea).first();
                
                if( $pasteTextarea.length > 0 ) {
                
                    //watch for paste of text into the textarea and then convert
                    var duration = 100;
                    $.pasteWatcher = { 
                        timer: setInterval( function() {

                            //interval may have been queued and the previous interval may have cleaned the timer: see http://ejohn.org/bconsole.log/how-javascript-timers-work/
                            if( !$.pasteWatcher ) return;
                            
                            //If text has been pasted
                            if( $pasteTextarea.val().length > 0 ) {
                            
                                //jettison timer - we've finished waiting
                                clearInterval( $.pasteWatcher.timer );
                                $.pasteWatcher = false;

                                //lets flash so it looks like we're doing something
                                $pasteTextarea.addClass("flash");
                                
                                //catch animation end
                                $pasteTextarea.one('animationend oAnimationEnd webkitAnimationEnd',   
                                    function(e) {
                                        $pasteTextarea.css('background-color', scraper.entries.length > 0 ? 'green' : 'red');
                                  });                                
                                 
                                 //parse the pasted PDF
                                 parsePDF( scraper, $pasteTextarea.val() );
                                 
                                 //update
                                 $('#'+selectID).change();
                                 
                                 $.fancybox.update();
                            }
                        }, duration )
                    };                
                }
            }
        });
    }  
}

