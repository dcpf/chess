(function(){
    
Polymer({
    
    ready: function() {
        this.gameObj = '';
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
        this.$.findGameByIdError.style.display = 'none';
        this.$.findGameByIdSuccess.style.display = 'block';
        this.gameObj = JSON.stringify(res.response);
    },
    
    handleError: function (event, res) {
        this.$.findGameByIdSuccess.style.display = 'none';
        this.errMsg = res.xhr.responseText;
        this.$.findGameByIdError.style.display = 'block';
    }
    
});
    
})();