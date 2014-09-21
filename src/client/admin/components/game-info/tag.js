(function(){
    
Polymer({
    
    editGame: function () {
        event.preventDefault();
        this.fire('edit-game', {obj: this.obj});
    }
    
});
    
})();
