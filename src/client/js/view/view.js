var View = Backbone.View.extend({
    
    // Get the template's HTML and attach it to the parent element
    initTemplate: function (templateId, data) {
        data = data || {};
        var template = templates.JST[templateId](data);
        this.$el.html(template);
        this.parent.empty();
        this.parent.append(this.$el);
    }
    
});