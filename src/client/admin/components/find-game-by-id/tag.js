(function(){
    
Polymer({
    
    ready: function() {
        this.response = '';
        this.errMsg = '';
    },
    
    submit: function(event, detail, sender) {
        if (event.keyCode === 13) {
            var xhr = this.$.xhr;
            xhr.params = {"gameID": this.$.gameID.value};
            xhr.go();
        }
    },
    
    handleSuccess: function (event, res) {
        this.$.errMsg.style.display = 'none';
        this.$.response.style.display = 'block';
        this.response = JSON.stringify(res.response);
    },
    
    handleError: function (event, res) {
        this.$.response.style.display = 'none';
        this.errMsg = res.xhr.responseText;
        this.$.errMsg.style.display = 'block';
    }
    
});
    
})();