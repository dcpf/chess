(function(){
    
Polymer({
    
    ready: function() {
        this.response = {};
        this.errMsg = '';
    },
    
    init: function() {
        this.response = {};
        this.errMsg = '';
        this.$.errMsg.style.display = 'none';
        this.$.response.style.display = 'none';
        this.$.email.value = '';
        this.$.email.focus();
    },
    
    submit: function(event, detail, sender) {
        if (event.keyCode === 13) {
            var xhr = this.$.xhr;
            xhr.params = {"email": this.$.email.value};
            if (csrfToken) {
                xhr.params._csrf = csrfToken;
            }
            xhr.go();
        }
    },
    
    handleSuccess: function (event, res) {
        this.$.errMsg.style.display = 'none';
        this.$.response.style.display = 'block';
        this.response = res.response;
    },
    
    handleError: function (event, res) {
        this.$.response.style.display = 'none';
        this.errMsg = res.xhr.responseText;
        this.$.errMsg.style.display = 'block';
    }
    
});
    
})();