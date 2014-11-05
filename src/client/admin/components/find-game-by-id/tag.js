(function(){
    
Polymer({
    
    ready: function() {
        this.obj = {};
        this.errMsg = '';
    },
    
    reset: function() {
        this.obj = {};
        this.errMsg = '';
        this.$.errMsg.style.display = 'none';
        this.$.response.style.display = 'none';
        this.$.gameID.value = '';
        this.$.gameID.focus();
    },
    
    submit: function(event, detail, sender) {
        if (event.keyCode === 13) {
            var xhr = this.$.xhr;
            xhr.params = {"gameID": this.$.gameID.value};
            if (csrfToken) {
                xhr.params._csrf = csrfToken;
            }
            xhr.go();
        }
    },
    
    handleSuccess: function (event, res) {
        this.$.errMsg.style.display = 'none';
        this.$.response.style.display = 'block';
        this.obj = res.response;
    },
    
    handleError: function (event, res) {
        this.$.response.style.display = 'none';
        this.errMsg = res.xhr.responseText;
        this.$.errMsg.style.display = 'block';
    }
    
});
    
})();