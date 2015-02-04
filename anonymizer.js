var head = document.getElementsByTagName('head')[0];
var script = document.createElement('scr'+'ipt');
script.setAttribute("type","text/javascript");
script.setAttribute("src", "https://cdn.rawgit.com/importmybankstatement/bookmarklets/v1.0.0/core.js");
head.appendChild(script);        

//http://stackoverflow.com/questions/298750/how-do-i-select-text-nodes-with-jquery
function getTextNodesIn(node, includeWhitespaceNodes) {
    var textNodes = [], nonWhitespaceMatcher = /\S/;

    function getTextNodes(node) {
        if (node.nodeType == 3) {
            if (includeWhitespaceNodes || nonWhitespaceMatcher.test(node.nodeValue)) {
                textNodes.push(node);
            }
        } else {
            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                getTextNodes(node.childNodes[i]);
            }
        }
    }

    getTextNodes(node);
    return textNodes;
}

function scrape(scraper) {
    var $ = jQuery;
    var re1 = /[A-Z]/gi;
    var re2 = /\d/g;
    
    var nodes = getTextNodesIn( document.body || document.getElementsByTagName('body')[0] );

    for(var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var text = '['+i+']'+$(node).text().replace(re1, 'A').replace(re2, '9');
        node.data = text;
    }
    
    console.log("Showing lightbox");

    //remove progress bar
    scraper.removeProgressBar();
    
    var scraper = scraper;
    var pID = scraper.guid(), 
        downloadID = scraper.guid(), 
        mailRef = scraper.guid(),
        textarea = scraper.guid(),
        //condense multiple line breaks and remove script tags
        //http://stackoverflow.com/questions/6659351/removing-all-script-tags-from-html-with-js-regular-expression
        anonymized_content = document.documentElement.outerHTML.replace(/(\r\n?|\n)+/g, "\n").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');      
                      
    display_csv  = '<p id="'+pID+'" class=\"csv\"><textarea cols=80 style="width: 100%; height: 100%; box-sizing: border-box; border: 1px solid #FF0000; resize:none;">'+anonymized_content+'</textarea></p>';
    display_csv += '<div>';
    display_csv += '<button id="'+downloadID+'">Download</button>';
    display_csv += '</div>';
    
    // show csv content in fancybox
    $.fancybox({
        'content' : display_csv,
        height: 300,
        beforeShow : function() {      
        },
        beforeClose: function() {
        },
        afterShow: function() {
                                
            $('#'+downloadID).click(function() {
            
                var pom = document.createElement('a');
                var extension = ".html";
                var filename = "statement";

                pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( anonymized_content ));
                pom.setAttribute('download', filename + extension);
                pom.click();
            
            });                        
        }
    });    
}
