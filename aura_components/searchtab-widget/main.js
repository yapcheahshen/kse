define(['backbone','text!../config.json'], function(Backbone,config) {
  return {
    type: 'Backbone',
   
    model:new Backbone.Model(),
    initialize: function() {

    }
  };
});
