(function(){
    
Polymer({
    
    ready: function() {
        this.response = '';
        this.errMsg = '';
    },
    
    init: function(){
        this.$.email.focus();
    },
    
    submit: function(event, detail, sender) {
        if (event.keyCode === 13) {
            var xhr = this.$.xhr;
            xhr.params = {"email": this.$.email.value};
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
    },
    
    editGame: function (event) {
        event.preventDefault();
        var gameID = event.target.text,
            numObjects = this.response.length,
            i = 0,
            obj;
        for (; i < numObjects; i++) {
            obj = this.response[i];
            if (obj._id === gameID) {
                break;
            }
        }
        this.fire('edit-game', {obj: obj});
    }
    
});
    
})();