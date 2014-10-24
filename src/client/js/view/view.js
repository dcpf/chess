var View = Backbone.View.extend({
    
    /*
    * Create and attach the template
    */
    initTemplate: function (templateId) {
        var template = _.template($('#' + templateId).html());
        this.$el.html(template());
        this.parent.empty();
        this.parent.append(this.$el);
    }
    
});