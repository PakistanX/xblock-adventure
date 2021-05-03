var AdventureStepView = Backbone.Marionette.LayoutView.extend({
    template: "#adventure-step-view-template",

    ui: {
        'choices': '.choices .choices-list'
    },

    events: {
        "click @ui.choices .choice-selector": 'onChoiceSelect'
    },

    initialize: function(options) {
        this.app = options.app;
        _.bindAll(this, 'getData', 'onChoiceSelect');
        this.app.vent.on('choices:load', this.onChoicesLoad);
        this.registerHandlers();
        this.initializeXBlockRegions();
    },

    initializeXBlockRegions: function() {
        var self = this;
        _.each(this.model.get('xblocks'), function(xblock) {
            self.addRegion(xblock.id, "#" + xblock.id + ".step-child");
        });
    },

    onRender: function() {
        /* TODO refactoring: do not initialize the xblock like this, create a common XBlockView */
        var self = this;
        _.each(this.model.get('xblocks'), function(xblock) {
            var options = xblock;
            if (!self.model.get('is_studio')) {
                options.xblock.useCurrentHost = true;
                $('#'+options.id, self.el).xblock(options.xblock);
            }
            else {
                $('#'+options.id, self.el).html(
                    '<p>Ooyala-player child will be displayed in the LMS.</p>'
                );
            }
        });

        this.selectStudentChoice();
    },

    registerHandlers: function() {
        this.app.reqres.setHandler("stepData", this.getData);
    },

    onChoicesLoad: function() {
        if (wistiaEmbeds.iframes.length > 0) {
            wistiaEmbeds.bind("end", function() {
                $(".navigation-view").addClass("show").removeClass("hide")
                $('[data-type="MCQBlock"]').addClass("show").removeClass("hide")
            });
            $(".navigation-view").addClass("hide").removeClass("show")
            $('[data-type="MCQBlock"]').addClass("hide").removeClass("show")
        }
        $("input[type=radio]").map( function() {
            $("[data-type='HTMLBlock'] [name='"+ $(this).attr('value') + "']").hide()
            $(this).parent().parent().removeClass("checked")
        });

        // wrapping video and MCQs section in order to show feedback below MCQs options
        $("[data-type='HTMLBlock'] [name='video']").
          parent().
          parent().
          next('.step-child').
          andSelf().
          wrapAll("<div class='wrapper-video' />")
    },

    getData: function() {
        var data = {};

        // Returns the selected choice
        var selected_choice = $('input[type=radio]:checked', this.ui.choices);
        if (selected_choice.length) {
            data['choice'] = selected_choice.val();
        };

        $("input[type=radio]").map( function() {
            $("[data-type='HTMLBlock'] [name='"+ $(this).attr('value') + "']").hide()
            $(this).parent().parent().removeClass("checked")
        });

        $("[data-type='HTMLBlock'] [name='"+ selected_choice.val() +"']").show()
        selected_choice.parent().parent().addClass("checked")

        return data;
    },

    selectStudentChoice: function() {
        if (this.model.get('student_choice')) {
            $('input[value=' + this.model.get('student_choice')+']', this.el).prop( "checked", true );
            this.app.vent.trigger('step:choice:select', this.model);
        }
    },

    onChoiceSelect: function() {
        this.app.vent.trigger('step:choice:select', this.model);
    }
});
