var View = Backbone.View.extend({
    
    renderTemplate: function (templateId, data) {
        data = data || {};
        var template = templates.JST[templateId](data);
        this.$el.html(template);
        this.parent.empty();
        this.parent.append(this.$el);
    }
    
});