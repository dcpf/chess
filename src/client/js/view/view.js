const View = Backbone.View.extend({

    // Get the template's HTML and attach it to the parent element
    initTemplate: function (templateId, data) {
        this._attachTemplate(templateId, data);
        this.parent.empty();
        this.parent.append(this.$el);
    },

    // Get the dialog's HTML and attach it to the dialogsContainer element
    initDialog: function (templateId, data) {
        this._attachTemplate(templateId, data);
        $('#dialogsContainer').append(this.$el);
    },

    /**
    * Parse the template and attach it to the el
    */
    _attachTemplate: function (templateId, data) {
        data = data || {};
        const template = templates.JST[templateId](data);
        this.$el = $(template);
    }

});
