(function(){
    
Polymer({
    
    ready: function() {
        this.response = '';
        this.obj = {};
        this.errMsg = '';
    },
    
    init: function(obj) {
        this.obj = obj;
        this.$.errMsg.style.display = 'none';
        this.$.response.style.display = 'none';
    },
    
    submit: function(event, detail, sender) {
        var xhr = this.$.xhr;
        xhr.params = {"obj": JSON.stringify(this.obj)};
        if (csrfToken) {
            xhr.params._csrf = csrfToken;
        }
        xhr.go();
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