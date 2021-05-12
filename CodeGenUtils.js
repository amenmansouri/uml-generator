define(function (require, exports, module) {
    "use strict";

    /**
     * CodeWriter
     * @constructor
     */
    function CodeWriter(indentString) {
        
        /** @member {Array.<string>} lines */
        this.lines = [];

        /**@member {Array.<string>} javalines */
        this.javalines = [];

        /** @member {string} indentString */
        this.indentString = (indentString ? indentString : "    "); // default 4 spaces

        /** @member {Array.<string>} indentations */
        this.indentations = [];
    }

    /**
     * Indent
     */    
    CodeWriter.prototype.indent = function () {
        this.indentations.push(this.indentString);
    };

    /**
     * Outdent
     */    
    CodeWriter.prototype.outdent = function () {
        this.indentations.splice(this.indentations.length-1, 1);
    };

    /**
     * Write a line
     * @param {string} line
     */    
    CodeWriter.prototype.writeLine = function (line) {
        if (line) {
            this.lines.push(this.indentations.join("") + line);    
        } else {
            this.lines.push("");
        }        
    };

    /**
     * remove list JavaLines   
     * 
     */
    CodeWriter.prototype.deleteJavaLines = function(){
        this.javalines = [];
        //this.lines = [];
    } ;

    /**
     * remove list Lines   
     * 
     */
    CodeWriter.prototype.deleteLines = function(){
        this.lines = [];
        //this.lines = [];
    } ;

     /**
     * remove  Lines   
     * 
     */
    CodeWriter.prototype.deleteLines = function() {
        this.lines = [];
    } ;

    /**
     * Write a line
     * @param {string} line
     */    
    CodeWriter.prototype.writeJavaLine = function (line) {
        if (line) {
            this.javalines.push(this.indentations.join("") + line);    
        } else {
            this.javalines.push("");
        }        
    };
CodeWriter.prototype.readfile= function(data){
    this.javalines.push(this.indentations.join("")+ data);
}

    /**
     * Return as all string data
     * @return {string}
     */    
    CodeWriter.prototype.getData = function () {
        return this.lines.join("\n");
    };

    /**
     * Return as all string data
     * @return {string}
     */    
    CodeWriter.prototype.getJavaData = function () {
        return this.javalines.join("\n");
    };

    exports.CodeWriter = CodeWriter;

});